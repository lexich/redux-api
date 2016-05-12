"use strict";

export default function (fetch) {
  return function (url, opts) {
    return fetch(url, opts).then(
      (resp)=> resp.status !== 204 ? resp.json() : {});
  };
}
