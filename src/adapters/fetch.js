"use strict";

function processData(data) {
  try {
    return JSON.parse(data);
  } catch (err) {
    return data;
  }
}

function toJSON(resp) {
  if (resp.text) {
    return resp.text().then(processData);
  } else if (resp instanceof Promise) {
    return resp.then(processData);
  } else {
    return Promise.resolve(resp).then(processData);
  }
}

export default function (fetch) {
  return (url, opts)=> fetch(url, opts).then(resp=>
    toJSON(resp).then((data)=> {
      if (resp.status >= 200 && resp.status < 300) {
        return data;
      } else if (resp.status >= 400) {
        return Promise.reject({ status: resp.status, statusText: resp.statusText });
      } else {
        return Promise.reject(data);
      }
    })
  );
}
