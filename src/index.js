"use strict";

import isArray from "lodash/lang/isArray";
import isObject from "lodash/lang/isObject";
import isString from "lodash/lang/isString";
import isNumber from "lodash/lang/isNumber";
import isBoolean from "lodash/lang/isBoolean";

import reduce from "lodash/collection/reduce";

import reducerFn from "./reducerFn";
import actionFn from "./actionFn";

/**
 * Default responce transformens
 */
export const transformers = {
  array(data) {
    return !data ? [] : isArray(data) ? data : [data];
  },
  object(data) {
    if (!data) {
      return {};
    }
    if (isArray(data) || isString(data) || isNumber(data) || isBoolean(data) || !isObject(data)) {
      return {data};
    } else {
      return data;
    }
  }
};

/**
 * Default configuration for each endpoint
 * @type {Object}
 */
const defaultEndpointConfig = {
  transformer: transformers.object
};

let instanceCounter = 0;
const PREFIX = "@@redux-api";
/**
 * Entry api point
 * @param  {Object} Rest api configuration
 * @return {actions, reducers}        { actions, reducers}
 * @example ```js
 *   const api = reduxApi({
 *     test: "/plain/url",
 *     testItem: "/plain/url/:id",
 *     testModify: {
 *       url: "/plain/url/:endpoint",

 *       transformer: (data)=> !data ?
 *          { title: "", message: "" } :
 *          { title: data.title, message: data.message },
 *       options: {
 *         method: "post"
 *         headers: {
 *           "Accept": "application/json",
 *           "Content-Type": "application/json"
 *         }
 *       }
 *     }
 *   });
 *   // register reducers
 *
 *   // call actions
 *   dispatch(api.actions.test());
 *   dispatch(api.actions.testItem({id: 1}));
 *   dispatch(api.actions.testModify({endpoint: "upload-1"}, {
 *     body: JSON.stringify({title: "Hello", message: "World"})
 *   }));
 * ```
 */
export default function reduxApi(config, fetch) {
  const counter = instanceCounter++;
  return reduce(config, (memo, value, key)=> {
    const keyName = value.reducerName || key;
    const url = typeof value === "object" ? value.url : value;
    const opts = typeof value === "object" ?
      { ...defaultEndpointConfig, ...value } :
      { ...defaultEndpointConfig };
    const {transformer, options} = opts;
    const initialState = { loading: false, data: transformer() };
    const ACTIONS = {
      actionFetch: `${PREFIX}@${counter}@${keyName}`,
      actionSuccess: `${PREFIX}@${counter}@${keyName}_success`,
      actionFail: `${PREFIX}@${counter}@${keyName}_fail`,
      actionReset: `${PREFIX}@${counter}@${keyName}_delete`
    };

    memo.actions[key] = actionFn(url, key, options, ACTIONS, opts.fetch || fetch);
    if (!memo.reducers[keyName]) {
      memo.reducers[keyName] = reducerFn( initialState, ACTIONS, transformer );
    }
    return memo;
  }, {actions: {}, reducers: {}});
}
