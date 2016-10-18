"use strict";

function toJSON(resp) {
  return resp.text().then((data)=> {
    try {
      return JSON.parse(data);
    } catch (err) {
      return data;
    }
  });
}

export default function (fetch) {
  return function (url, opts) {
    return fetch(url, opts).then(resp=> toJSON(resp)
              .then((data)=> {
                if (resp.status >= 200 && resp.status < 300) {
                  return data;
                } else {
                  return Promise.reject(data);
                }
              })
    );
  };
}
