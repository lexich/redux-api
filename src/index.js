"use strict";

import isArray from "lodash/lang/isArray";
import isObject from "lodash/lang/isObject";
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
    return !data ? {} : isObject(data) ? data : {data};
  }
};

/**
 * Default configuration for each endpoint
 * @type {Object}
 */
const defaultEndpointConfig = {
  action: "get",
  transformer: transformers.object
};

let instanceCounter = 0;
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
 *       action: "post",
 *       transformer: (data)=> !data ?
 *          { title: "", message: "" } :
 *          { title: data.title, message: data.message },
 *       options: {
 *         "Accept": "application/json",
 *         "Content-Type": "application/json"
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
    const url = typeof value === "object" ? value.url : value;
    const opts = typeof value === "object" ?
      { ...defaultEndpointConfig, ...value } :
      { ...defaultEndpointConfig };
    const {transformer, options} = opts;
    const initialState = { loading: false, data: transformer() };
    const ACTIONS = {
      actionFetch: `$$_API_${counter}_${key}`,
      actionSuccess: `$$_API_${counter}_${key}_success`,
      actionFail: `$$_API_${counter}_${key}_fail`,
      actionReset: `$$_API_${counter}_${key}_delete`
    };

    memo.actions[key] = actionFn(url, key, options, ACTIONS, opts.fetch || fetch);
    memo.reducers[key] = reducerFn( initialState, ACTIONS, transformer );
    return memo;
  }, {actions: {}, reducers: {}});
}
