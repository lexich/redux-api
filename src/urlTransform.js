"use strict";
import reduce from "lodash/collection/reduce";
import qs from "qs";

export default function urlTransform(url, params={}) {
  var urlWithParams = reduce(params,
    (url, value, key) => {
      url = url.replace(new RegExp(`\\(:${key}\\)`, "g"), function() {
        delete params[key];
        return value;
      });
      url = url.replace(new RegExp(`:${key}`, "g"), function() {
        delete params[key];
        return value;
      });
      return url;
    }, url);
  if (!urlWithParams) return urlWithParams;
  var cleanURL = urlWithParams.replace(new RegExp(`\\(:(.*?)\\)`, "g"), "");

  var finalURL = cleanURL;
  if (Object.keys(params).length > 0) {
    finalURL = `${cleanURL}?${qs.stringify(params)}`;
  }
  return finalURL;
}
