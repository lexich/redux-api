"use strict";
import reduce from "lodash/collection/reduce";

export default function urlTransform(url, params={}) {
  return reduce(params,
    (url, value, key)=> url.replace(new RegExp(`:${key}`, "g"), value), url);
}
