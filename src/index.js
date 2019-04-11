"use strict";

/* eslint no-void: 0 */

import reducerFn from "./reducerFn";
import actionFn from "./actionFn";
import transformers, { responseTransform } from "./transformers";
import async from "./async";
import cacheManager from "./utils/cache";
// export { transformers, async };

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
 * @param {Object} baseConfig baseConfig settings for Rest api
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

export default function reduxApi(config, baseConfig) {
  config || (config = {});

  const fetchHolder = {
    fetch: null,
    server: false,
    rootUrl: null,
    middlewareParser: null,
    options: {},
    responseHandler: null
  };

  const cfg = {
    use(key, value) {
      fetchHolder[key] = value;

      return this;
    },
    init(fetch, isServer = false, rootUrl) {
      /* eslint no-console: 0 */
      console.warn("Deprecated method, use `use` method");
      this.use("fetch", fetch);
      this.use("server", isServer);
      this.use("rootUrl", rootUrl);
      return this;
    },
    actions: {},
    reducers: {},
    events: {}
  };
  function fnConfigCallback(memo, value, key) {
    const opts =
      typeof value === "object"
        ? { ...defaultEndpointConfig, reducerName: key, ...value }
        : { ...defaultEndpointConfig, reducerName: key, url: value };

    if (opts.broadcast !== void 0) {
      /* eslint no-console: 0 */
      console.warn(
        "Deprecated `broadcast` option. you shoud use `events`" +
          "to catch redux-api events (see https://github.com/lexich/redux-api/blob/master/DOCS.md#Events)"
      );
    }

    const {
      url,
      urlOptions,
      options,
      transformer,
      broadcast,
      crud,
      reducerName,
      prefetch,
      postfetch,
      validation,
      helpers
    } = opts;

    const prefix = (baseConfig && baseConfig.prefix) || "";

    const ACTIONS = {
      actionFetch: `${PREFIX}@${prefix}${reducerName}`,
      actionSuccess: `${PREFIX}@${prefix}${reducerName}_success`,
      actionFail: `${PREFIX}@${prefix}${reducerName}_fail`,
      actionReset: `${PREFIX}@${prefix}${reducerName}_delete`,
      actionCache: `${PREFIX}@${prefix}${reducerName}_cache`,
      actionAbort: `${PREFIX}@${prefix}${reducerName}_abort`
    };

    const fetch = opts.fetch
      ? opts.fetch
      : function(...args) {
          return fetchHolder.fetch.apply(this, args);
        };

    const meta = {
      holder: fetchHolder,
      virtual: !!opts.virtual,
      actions: memo.actions,
      cache: cacheManager(opts.cache),
      urlOptions,
      fetch,
      broadcast,
      reducerName,
      prefetch,
      postfetch,
      validation,
      helpers,
      transformer,
      prefix,
      crud
    };

    memo.actions[key] = actionFn(url, key, options, ACTIONS, meta);

    if (!meta.virtual && !memo.reducers[reducerName]) {
      const data = transformer() || {};
      const sync = false;
      const syncing = false;
      const loading = false;
      const initialState = opts.cache
        ? {
            ...data,
            api: {
              ...data.api,
              sync,
              syncing,
              loading,
              cache: {},
              request: null
            }
          }
        : {
            ...data,
            api: { ...data.api, sync, syncing, loading, request: null }
          };

      const reducer = opts.reducer ? opts.reducer.bind(memo) : null;
      memo.reducers[reducerName] = reducerFn(
        responseTransform(initialState),
        ACTIONS,
        reducer
      );
    }
    memo.events[reducerName] = ACTIONS;
    return memo;
  }

  return Object.keys(config).reduce(
    (memo, key) => fnConfigCallback(memo, config[key], key, config),
    cfg
  );
}

reduxApi.transformers = transformers;
reduxApi.async = async;
