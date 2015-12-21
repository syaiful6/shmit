export default function request(url, options) {
  let hash = requestOptions(url, options);
  return new Promise((resolve, reject) => {
    let req = new XMLHttpRequest();
    req.open(hash.method, hash.url, true, hash.user, hash.password);
    req.onreadystatechange = (e) => {
      if(req.readyState !== 4) {
        return;
      }
      let status = req.status;
      if (status >= 200 && status < 300) {
        let response = e.target.response;
        if (hash.deserialize) {
          response = hash.deserialize(response);
        }
        resolve(response);
      } else {
        reject(new Error(req.statusText));
      }
    };

    if (hash.headers) {
      let headers = hash.headers;
      for (let index in headers) {
        let header = headers[index];
        req.setRequestHeader(index, header);
      }
    }
    if (hash.method !== 'GET') {
      req.send(hash.data);
    } else {
      req.send();
    }
  });
}

export function post(url, options) {
  let hash = options || {};
  hash.method = 'POST';
  return request(url, hash);
}

function requestOptions(url, options) {
  var hash = options || {};
  hash.url = url;
  hash.method = (hash.method).toUpperCase() || 'GET';
  hash.headers = hash.headers || {};
  return hash;
}

// utility function to encode data, whith url form encoded
export var urlFormEncode = function (data, options) {
  var opts = typeof options === 'object' ? options : {},
    optignorenull = opts.ignorenull || false,
    optsorted     = opts.sorted || false;

  function getNestValsArrAsStr(arr) {
    return arr.filter(function (e) {
      return typeof e === 'string' && e.length;
    }).join('&');
  }

  function getKeys(obj) {
    var keys = Object.keys(obj);

    return optsorted ? keys.sort() : keys;
  }

  function getObjNestVals (name, obj) {
    var objKeyStr = ':name[:prop]';

    return getNestValsArrAsStr(getKeys(obj).map(function (key) {
      return getNestVals(
        objKeyStr.replace(/:name/, name).replace(/:prop/, key), obj[key]
      );
    }));
  }

  function getArrNestVals (name, arr) {
    var arrKeyStr = ':name[]';

    return getNestValsArrAsStr(arr.map(function (elem) {
      return getNestVals(
        arrKeyStr.replace(/:name/, name), elem
      );
    }));
  }

  function getNestVals (name, value) {
    var whitespaceRe = /%20/g,
      encode = encodeURIComponent,
      type = typeof value,
      f = null;

    if (Array.isArray(value)) {
      f = getArrNestVals(name, value);
    } else if (type === 'string') {
      f = encode(name) + '=' + formEncodeString(value);
    } else if (type === 'number') {
      f = encode(name) + '=' + encode(value).replace(whitespaceRe, '+');
    } else if (type === 'boolean') {
      f = encode(name) + '=' + value;
    } else if (type === 'object') {
      if (value !== null) {
        f = getObjNestVals(name, value);
      } else if (!optignorenull) {
        f = encode(name) + '=null';
      }
    }

    return f;
  }

  // 5.1, http://www.w3.org/TR/html5/forms.html#url-encoded-form-data
  function manuallyEncodeChar (ch) {
    return '%' + ('0' + ch.charCodeAt(0).toString(16)).slice(-2).toUpperCase();
  };

  function formEncodeString (value) {
    return value
      .replace(/[^ !'()~\*]*/g, encodeURIComponent)
      .replace(/ /g, '+')
      .replace(/[!'()~\*]/g, manuallyEncodeChar);
  };

  return getNestValsArrAsStr(getKeys(data).map(function (key) {
    return getNestVals(key, data[key]);
  }));
};
