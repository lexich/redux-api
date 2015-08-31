"use strict";
import reduce from "lodash/collection/reduce";
import omit from "lodash/object/omit";
import keys from "lodash/object/keys";
import qs from "qs";

const rxClean = /(\(:[^\)]+\)|:[^\/]+)/g;

export default function urlTransform(url, params={}) {
  if (!url) { return ""; }
  const usedKeys = {};
  const urlWithParams = reduce(params,
    (url, value, key)=> url.replace(
      new RegExp(`(\\(:${key}\\)|:${key})`, "g"),
        ()=> (usedKeys[key] = value)), url);
  if (!urlWithParams) { return urlWithParams; }
  const cleanURL = urlWithParams.replace(rxClean, "");
  const usedKeysArray = keys(usedKeys);
  if (usedKeysArray.length !== keys(params).length) {
    const urlObject = cleanURL.split("?");
    const mergeParams = {
      ...(urlObject[1] && qs.parse(urlObject[1])),
      ...omit(params, usedKeysArray)
    };
    return `${urlObject[0]}?${qs.stringify(mergeParams)}`;
  }
  return cleanURL;
}
