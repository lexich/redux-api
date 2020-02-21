"use strict";

import fastApply from "fast-apply";
import libUrl from "url";
import urlTransform from "./urlTransform";
import merge from "./utils/merge";
import get from "./utils/get";
import fetchResolver from "./fetchResolver";
import PubSub from "./PubSub";
import createHolder from "./createHolder";
import {
  none,
  extractArgs,
  defaultMiddlewareArgsParser,
  CRUD
} from "./helpers";
import { getCacheManager } from "./utils/cache";

/**
 * Constructor for create action
 * @param  {String} url          endpoint's url
 * @param  {String} name         action name
 * @param  {Object} options      action configuration
 * @param  {Object} ACTIONS      map of actions
 * @param  {[type]} fetchAdapter adapter for fetching data
 * @return {Function+Object}     action function object
 */
export default function actionFn(url, name, options, ACTIONS = {}, meta = {}) {
  const {
    actionFetch,
    actionSuccess,
    actionFail,
    actionReset,
    actionCache,
    actionAbort
  } = ACTIONS;
  const pubsub = new PubSub();
  const requestHolder = createHolder();

  function getOptions(urlT, params, getState) {
    const globalOptions = !meta.holder
      ? {}
      : meta.holder.options instanceof Function
        ? meta.holder.options(urlT, params, getState)
        : meta.holder.options;
    const baseOptions = !(options instanceof Function)
      ? options
      : options(urlT, params, getState);
    return merge({}, globalOptions, baseOptions, params);
  }

  function getUrl(pathvars, params, getState) {
    const resultUrlT = urlTransform(url, pathvars, meta.urlOptions);
    let urlT = resultUrlT;
    let rootUrl = get(meta, "holder", "rootUrl");
    rootUrl = !(rootUrl instanceof Function)
      ? rootUrl
      : rootUrl(urlT, params, getState);
    if (rootUrl) {
      const rootUrlObject = libUrl.parse(rootUrl);
      const urlObject = libUrl.parse(urlT);
      if (!urlObject.host) {
        const urlPath =
          (rootUrlObject.path ? rootUrlObject.path.replace(/\/$/, "") : "") +
          "/" +
          (urlObject.path ? urlObject.path.replace(/^\//, "") : "");
        urlT = `${rootUrlObject.protocol}//${rootUrlObject.host}${urlPath}`;
      }
    }
    return urlT;
  }

  function fetch(
    pathvars,
    params,
    options = {},
    getState = none,
    dispatch = none
  ) {
    const urlT = getUrl(pathvars, params, getState);
    const opts = getOptions(urlT, params, getState);
    let id = meta.reducerName || "";
    const cacheManager = getCacheManager(options.expire, meta.cache);

    if (cacheManager && getState !== none) {
      const state = getState();
      const cache = get(state, meta.prefix, meta.reducerName, "cache");
      id += "_" + cacheManager.id(pathvars, params);
      const data = cacheManager.getData(
        cache && id && cache[id] !== undefined && cache[id]
      );
      if (data !== undefined) {
        return Promise.resolve(data);
      }
    }
    const response = meta.fetch(urlT, opts);
    if (cacheManager && dispatch !== none && id) {
      response.then(data => {
        dispatch({ type: actionCache, id, data, expire: cacheManager.expire });
      });
    }
    return response;
  }

  function abort() {
    const defer = requestHolder.pop();
    const err = new Error("Application abort request");
    defer && defer.reject(err);
    return err;
  }

  /**
   * Fetch data from server
   * @param  {Object}   pathvars    path vars for url
   * @param  {Object}   params      fetch params
   * @param  {Function} getState    helper meta function
   */
  function request(
    pathvars,
    params,
    options,
    getState = none,
    dispatch = none
  ) {
    const response = fetch(pathvars, params, options, getState, dispatch);
    const result = !meta.validation
      ? response
      : response.then(
          data =>
            new Promise((resolve, reject) =>
              meta.validation(data, err => (err ? reject(err) : resolve(data)))
            )
        );
    let ret = result;
    const responseHandler = get(meta, "holder", "responseHandler");
    if (responseHandler) {
      if (result && result.then) {
        ret = result.then(
          data => {
            const res = responseHandler(null, data);
            if (res === undefined) {
              return data;
            } else {
              return res;
            }
          },
          err => responseHandler(err)
        );
      } else {
        ret = responseHandler(result);
      }
    }
    ret && ret.catch && ret.catch(none);
    return ret;
  }

  /**
   * Fetch data from server
   * @param  {Object}   pathvars    path vars for url
   * @param  {Object}   params      fetch params
   * @param  {Function} callback)   callback execute after end request
   */
  function fn(...args) {
    const [pathvars, params, callback] = extractArgs(args);
    const syncing = params ? !!params.syncing : false;
    params && delete params.syncing;
    pubsub.push(callback);
    return (...middlewareArgs) => {
      const middlewareParser =
        get(meta, "holder", "middlewareParser") || defaultMiddlewareArgsParser;
      const { dispatch, getState } = middlewareParser(...middlewareArgs);
      const state = getState();
      const isLoading = get(state, meta.prefix, meta.reducerName, "loading");
      if (isLoading) {
        return Promise.reject("isLoading");
      }
      const requestOptions = { pathvars, params };
      const prevData = get(state, meta.prefix, meta.reducerName, "data");
      dispatch({ type: actionFetch, syncing, request: requestOptions });
      const fetchResolverOpts = {
        dispatch,
        getState,
        request: requestOptions,
        actions: meta.actions,
        prefetch: meta.prefetch
      };
      if (Object.defineProperty) {
        Object.defineProperty(fetchResolverOpts, "requestOptions", {
          get() {
            /* eslint no-console: 0 */
            console.warn("Deprecated option, use `request` option");
            return requestOptions;
          }
        });
      } else {
        fetchResolverOpts.requestOptions = requestOptions;
      }

      const result = new Promise((done, fail) => {
        fetchResolver(0, fetchResolverOpts, err => {
          if (err) {
            pubsub.reject(err);
            return fail(err);
          }
          new Promise((resolve, reject) => {
            requestHolder.set({
              resolve,
              reject,
              promise: request(pathvars, params, {}, getState, dispatch).then(
                resolve,
                reject
              )
            });
          }).then(
            d => {
              requestHolder.pop();
              const data = meta.transformer(d, prevData, {
                type: actionSuccess,
                request: requestOptions
              });
              dispatch({
                data,
                origData: d,
                type: actionSuccess,
                syncing: false,
                request: requestOptions
              });
              if (meta.broadcast) {
                meta.broadcast.forEach(type => {
                  dispatch({
                    type,
                    data,
                    origData: d,
                    request: requestOptions
                  });
                });
              }
              if (meta.postfetch) {
                meta.postfetch.forEach(postfetch => {
                  postfetch instanceof Function &&
                    postfetch({
                      data,
                      getState,
                      dispatch,
                      actions: meta.actions,
                      request: requestOptions
                    });
                });
              }
              pubsub.resolve(data);
              done(data);
            },
            error => {
              dispatch({
                error,
                type: actionFail,
                loading: false,
                syncing: false,
                request: requestOptions
              });
              pubsub.reject(error);
              fail(error);
            }
          );
        });
      });
      result.catch(none);
      return result;
    };
  }

  /*
    Pure rest request
   */
  fn.request = function(pathvars, params, options) {
    return request(pathvars, params, options || {});
  };

  /**
   * Reset store to initial state
   */
  fn.reset = mutation => {
    abort();
    return mutation === "sync"
      ? { type: actionReset, mutation }
      : { type: actionReset };
  };

  /*
    Abort request
   */
  fn.abort = function() {
    const error = abort();
    return { type: actionAbort, error };
  };

  fn.force = function(...args) {
    return (dispatch, getState) => {
      const state = getState();
      const isLoading = get(state, meta.prefix, meta.reducerName, "loading");
      if (isLoading) {
        dispatch(fn.abort());
      }
      return fn(...args)(dispatch, getState);
    };
  };

  /**
   * Sync store with server. In server mode works as usual method.
   * If data have already synced, data would not fetch after call this method.
   * @param  {Object} pathvars    path vars for url
   * @param  {Object} params      fetch params
   * @param  {Function} callback) callback execute after end request
   */
  fn.sync = (...args) => {
    const [pathvars, params, callback] = extractArgs(args);
    const isServer = meta.holder ? meta.holder.server : false;
    return (dispatch, getState) => {
      const state = getState();
      const store = get(state, meta.prefix, name);
      if (!isServer && store && store.sync) {
        callback(null, store.data);
        return;
      }
      const modifyParams = { ...params, syncing: true };
      return fn(pathvars, modifyParams, callback)(dispatch, getState);
    };
  };

  let helpers = meta.helpers || {};
  if (meta.crud) {
    helpers = { ...CRUD, ...helpers };
  }
  const fnHelperCallback = (memo, func, helpername) => {
    if (memo[helpername]) {
      throw new Error(
        `Helper name: "${helpername}" for endpoint "${name}" has been already reserved`
      );
    }
    const { sync, call } = func instanceof Function ? { call: func } : func;
    memo[helpername] = (...args) => (dispatch, getState) => {
      const index = args.length - 1;
      const callbackFn = args[index] instanceof Function ? args[index] : none;
      const helpersResult = fastApply(
        call,
        { getState, dispatch, actions: meta.actions },
        args
      );
      const result = new Promise((resolve, reject) => {
        const callback = (err, data) => {
          err ? reject(err) : resolve(data);
          callbackFn(err, data);
        };
        // If helper alias using async functionality
        if (helpersResult instanceof Function) {
          helpersResult((error, newArgs = []) => {
            if (error) {
              callback(error);
            } else {
              fastApply(sync ? fn.sync : fn, null, newArgs.concat(callback))(
                dispatch,
                getState
              );
            }
          });
        } else {
          // if helper alias is synchronous
          const [pathvars, params] = helpersResult;
          fastApply(sync ? fn.sync : fn, null, [pathvars, params, callback])(
            dispatch,
            getState
          );
        }
      });
      result.catch(none);
      return result;
    };
    return memo;
  };

  return Object.keys(helpers).reduce(
    (memo, key) => fnHelperCallback(memo, helpers[key], key, helpers),
    fn
  );
}
