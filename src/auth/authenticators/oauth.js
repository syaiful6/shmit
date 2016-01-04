import request, { urlFormEncode } from 'shopie/utils/request';
import { merge } from 'shopie/utils/collections';
import signal from '../signal';

function normalizeExpirationTime(expiresIn) {
  if (expiresIn) {
    return new Date((new Date().getTime()) + expiresIn * 1000).getTime();
  }
}

export default function OauthAuthenticator (clientId, clientSecret,
  tokenEndpoint = '/o/token/', tokenRevokeEndpoint = '/o/revoke_token/') {
  this.tokenEndpoint = tokenEndpoint ;
  this.tokenRevokeEndpoint = tokenRevokeEndpoint;
  this.clientId = clientId;
  this.clientSecret = clientSecret;
  this._refreshTokenTimeout = null;
}

Object.assign(OauthAuthenticator.prototype, {
  restore: function (data) {
    return new Promise((resolve, reject) => {
      let now = (new Date()).getTime();
      if (data['expired_at'] && data['expired_at'] < now) {
        this._refreshAccessToken(
          data['expires_in'], data['refresh_token']
        ).then(resolve, reject);
      } else {
        if (!data['access_token']) {
          reject(new Error('no data access_token'));
        } else {
          this._scheduleRefreshToken(
            data['expires_in'], data['expires_at'], data['refresh_token']
          );
          resolve(data);
        }
      }
    });
  },

  authenticate: function(username, password, scope = ['read', 'write']) {
    return new Promise((resolve, reject) => {
      let data = {
        'grant_type': 'password',
        username,
        password
      },
        endpoint = this.tokenEndpoint;
      if (scope) {
        data.scope = scope;
      }
      this.makeRequest(endpoint, data).then((response) => {
        let expired = normalizeExpirationTime(response['expires_in']);
        this._scheduleRefreshToken(response['expires_in'], expired,
          response['refresh_token']
        );
        if (expired) {
          response.expired_at = expired;
        }
        resolve(response);
      }, (err) => {
        reject(err)
      });
    });
  },

  authorize: function (data, block) {
    var accessToken = data['access_token'];
    if (accessToken) {
      block('Authorization', `Bearer ${accessToken}`);
    }
  },

  invalidate: function (data) {
    let endpoint = this.tokenRevokeEndpoint;
    let successHandler = function (resolve) {
      this._refreshTokenTimeout = null;
      resolve();
    };
    return new Promise((resolve, reject) => {
      if (endpoint) {
        let request = [];
        for (let item of ['access_token', 'refresh_token']) {
          let token = data[item];
          if (token) {
            request.push(this.makeRequest(endpoint, {
              'token_type_hint': item, token
            }));
          }
        }
        Promise.all(request).then(successHandler, reject);
      } else {
        successHandler.call(this, resolve);
      }
    });
  },

  makeRequest: function (url, data) {
    var clientId = this.clientId,
      clientSecret = this.clientSecret,
      data = Object.assign(data, {client_id: clientId, client_secret: clientSecret}),
      config = {
        method: 'POST',
        data: urlFormEncode(data),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json"
        }
      };
    return request(url, config).then(JSON.parse);
  },

  _scheduleRefreshToken: function (expiresIn, expiresAt, refreshToken) {
    var now = (new Date()).getTime();
    if (! expiresAt && expiresIn) {
      expiresAt = new Date(now + expiresIn * 1000).getTime();
    }
    let offset = (Math.floor(Math.random() * 5) + 5) * 1000;
    if (refreshToken && expiresAt && expiresAt > now - offset) {
      if (this._refreshTokenTimeout != null) {
        window.clearTimeout(this._refreshTokenTimeout);
      }
      this._refreshTokenTimeout = null;
      this._refreshTokenTimeout = window.setTimeout(() => {
        this._refreshAccessToken(expiresIn, refreshToken);
      }, expiresAt - now - offset);
    }
  },

  _refreshAccessToken: function (expiresIn, refreshToken) {
    let data = {
      'grant_type': 'refresh_token',
      'refresh_token': refreshToken
    },
    endpoint = this.tokenEndpoint;
    return new Promise((resolve, reject) => {
      this.makeRequest(endpoint, data).then((response) => {
        expiresIn       = response['expires_in'] || expiresIn;
        refreshToken    = response['refresh_token'] || refreshToken;
        var expiresAt = normalizeExpirationTime(expiresIn);
        let data = merge(response, {
          'expires_in': expiresIn,
          'expires_at': expiresAt,
          'refresh_token': refreshToken
        });
        this._scheduleRefreshToken(expiresIn, null, refreshToken);
        this._dispatchSessionEvent(data);
        resolve(data);
      }, () => reject());
    });
  },

  _dispatchSessionEvent: function (data) {
    signal.send('authenticator:updated', data);
  }
});
