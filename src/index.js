"use strict";

import isArray from "lodash/lang/isArray";
import isObject from "lodash/lang/isObject";
import isString from "lodash/lang/isString";
import isNumber from "lodash/lang/isNumber";
import isBoolean from "lodash/lang/isBoolean";

import reduce from "lodash/collection/reduce";
import size from "lodash/collection/size";

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

const PREFIX = "@@redux-api";
/**
 * Entry api point
 * @param {Object} config Rest api configuration
 * @param {Function} fetch Adapter for rest requests
 * @param {Boolean} isServer false by default (fif you want to use it for isomorphic apps)
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
export default function reduxApi(config) {
  const fetchHolder = {
    fetch: null,
    server: false
  };

  const cfg = {
    init: null,
    actions: {},
    reducers: {},
    events: {}
  };

  const reduxApiObject = reduce(config, (memo, value, key)=> {
    const opts = typeof value === "object" ?
      { ...defaultEndpointConfig, reducerName: key, ...value } :
      { ...defaultEndpointConfig, reducerName: key, url: value };

    const {
      url, options, transformer,
      broadcast, virtual, reducerName
    } = opts;

    const ACTIONS = {
      actionFetch: `${PREFIX}@${reducerName}`,
      actionSuccess: `${PREFIX}@${reducerName}_success`,
      actionFail: `${PREFIX}@${reducerName}_fail`,
      actionReset: `${PREFIX}@${reducerName}_delete`
    };

    const meta = {
      holder: opts.fetch ? { fetch: opts.fetch } : fetchHolder,
      broadcast,
      virtual: size(broadcast) > 0 ? !!virtual : false
    };

    memo.actions[key] = actionFn(url, key, options, ACTIONS, meta);

    if (!meta.virtual && !memo.reducers[reducerName]) {
      const initialState = {
        sync: false,
        syncing: false,
        loading: false,
        data: transformer()
      };
      memo.reducers[reducerName] = reducerFn(initialState, ACTIONS, transformer);
      memo.events[reducerName] = ACTIONS;
    }
    return memo;
  }, cfg);

  reduxApiObject.init = function(fetch, isServer=false) {
    fetchHolder.fetch = fetch;
    fetchHolder.server = isServer;
    return reduxApiObject;
  };

  return reduxApiObject;
}
