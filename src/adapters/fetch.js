"use strict";

function processData(data) {
  try {
    return JSON.parse(data);
  } catch (err) {
    return data;
  }
}

function toJSON(resp) {
  console.log("111", resp);
  if (resp.text) {
    return resp.text().then(processData);
  } else if (resp instanceof Promise) {
    return resp.then(processData);
  } else {
    return Promise.resolve(resp).then(processData);
  }
}

export default function (fetch) {
  return (url, opts)=> fetch(url, opts).then(
    (resp)=> {
        console.log("XXX", resp);
        return toJSON(resp).then((data)=> {
          if (resp.status >= 200 && resp.status < 300) {
            return data;
          } else {
            return Promise.reject(data);
          }
        });
    });
}
