"use strict";
import isArray from "lodash/lang/isArray";
import isObject from "lodash/lang/isObject";
import isString from "lodash/lang/isString";
import isNumber from "lodash/lang/isNumber";
import isBoolean from "lodash/lang/isBoolean";

/**
 * Default responce transformens
 */
export default {
  array(data) {
    return !data ? [] : isArray(data) ? data : [data];
  },
  object(data) {
    if (!data) {
      return {};
    }
    if (isArray(data) || isString(data) || isNumber(data) || isBoolean(data) || !isObject(data)) {
      return { data };
    } else {
      return data;
    }
  }
};
