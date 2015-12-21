import OauthAuthenticator from '../auth/authenticators/oauth';
import Storage from '../auth/store/local-storage';
import Session from '../auth/session';

export default {
  name: 'auth-session:main',
  after: 'application-configs:main',
  before: 'routes:definition',
  initialize(app) {
    m.startComputation();
    var configs = app.lookup('configs'),
    	authenticator = new OauthAuthenticator(configs.clientId, configs.clientSecret, '/o/token/', '/o/revoke_token/'),
    	storage = new Storage(),
    	session = new Session(authenticator, storage);

    app.register('session', session);
    session.restore();
    m.endComputation();
  }
};
