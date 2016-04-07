"use strict";

const toString = Object.prototype.toString;
const OBJECT = "[object Object]";

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
