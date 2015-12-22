"use strict";

import libUrl from "url";
import reduce from "lodash/collection/reduce";
import reducerFn from "./reducerFn";
import actionFn from "./actionFn";
import transformers from "./transformers";

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
    server: false,
    rootUrl: null
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
      url, options, transformer, broadcast,
      reducerName, prefetch, postfetch, validation, helpers
    } = opts;

    const ACTIONS = {
      actionFetch: `${PREFIX}@${reducerName}`,
      actionSuccess: `${PREFIX}@${reducerName}_success`,
      actionFail: `${PREFIX}@${reducerName}_fail`,
      actionReset: `${PREFIX}@${reducerName}_delete`
    };

    const meta = {
      fetch: opts.fetch ? opts.fetch : function() {
        return fetchHolder.fetch.apply(this, arguments);
      },
      holder: fetchHolder,
      broadcast,
      virtual: !!opts.virtual,
      actions: memo.actions,
      prefetch, postfetch, validation, helpers
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
    }
    memo.events[reducerName] = ACTIONS;
    return memo;
  }, cfg);

  reduxApiObject.init = function(fetch, isServer=false, rootUrl) {
    fetchHolder.fetch = fetch;
    fetchHolder.server = isServer;
    fetchHolder.rootUrl = rootUrl ? libUrl.parse(rootUrl) : null;
    return reduxApiObject;
  };

  return reduxApiObject;
}
