export default function request(url, options) {
  let hash = requestOptions(url, options);
  return new Promise((resolve, reject) => {
    let req = new XMLHttpRequest();
    req.open(hash.method, hash.url, true, hash.user, hash.password);
    req.onload = () => {
      let status = req.status;
      if (status >= 200 && status < 300 || status === 304) {
        let response = req.response;
        if (hash.deserialize) {
          response = hash.deserialize(response);
        }
        resolve(req.response);
      } else {
        reject(new Error(req.statusText));
      }
    };
    // Handle network errors
    req.onerror = function() {
      reject(new Error("Network Error"));
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

