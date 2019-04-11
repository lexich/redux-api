"use strict";

const toString = Object.prototype.toString;
const OBJECT = "[object Object]";

export const responseTransform = response => {
  if (response.api) {
    const keys = Object.keys(response);
    response.api.empty =
      keys.length < 2 || !!(response.items && response.items.length === 0);
  }
  return response;
};

/**
 * Default responce transformens
 */
export default {
  array(data) {
    return !data ? [] : Array.isArray(data) ? data : [data];
  },
  object(data) {
    if (!data) {
      return {};
    }
    return toString.call(data) === OBJECT ? data : { data };
  }
};
