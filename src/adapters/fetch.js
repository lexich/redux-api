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
  return (url, opts)=> fetch(url, opts).then((resp)=> {
    // Normalize IE9's response to HTTP 204 when Win error 1223.
    const status = (resp.status === 1223) ? 204 : resp.status;
    const statusText = (resp.status === 1223) ? "No Content" : resp.statusText;

    if (status >= 400) {
      return Promise.reject({ status, statusText });
    } else {
      return toJSON(resp).then((data)=> {
        if (status >= 200 && status < 300) {
          return data;
        } else {
          return Promise.reject(data);
        }
      });
    }
  });
}
