"use strict";

import fastApply from "fast-apply";
import libUrl from "url";
import urlTransform from "./urlTransform";
import merge from "./utils/merge";
import get from "./utils/get";
import fetchResolver from "./fetchResolver";
import PubSub from "./PubSub";
import createHolder from "./createHolder";
import { none, extractArgs, defaultMiddlewareArgsParser, CRUD } from "./helpers";

/**
 * Constructor for create action
 * @param  {String} url          endpoint's url
 * @param  {String} name         action name
 * @param  {Object} options      action configuration
 * @param  {Object} ACTIONS      map of actions
 * @param  {[type]} fetchAdapter adapter for fetching data
 * @return {Function+Object}     action function object
 */
export default function actionFn(url, name, options, ACTIONS={}, meta={}) {
  const { actionFetch, actionSuccess, actionFail, actionReset, actionCache } = ACTIONS;
  const pubsub = new PubSub();
  const requestHolder = createHolder();

  function getOptions(urlT, params, getState) {
    const globalOptions = !meta.holder ? {} :
      (meta.holder.options instanceof Function) ?
        meta.holder.options(urlT, params, getState) : (meta.holder.options);
    const baseOptions = !(options instanceof Function) ? options :
      options(urlT, params, getState);
    return merge({}, globalOptions, baseOptions, params);
  }

  function getUrl(pathvars, params, getState) {
    const resultUrlT = urlTransform(url, pathvars, meta.urlOptions);
    let urlT = resultUrlT;
    let rootUrl = get(meta, "holder", "rootUrl");
    rootUrl = !(rootUrl instanceof Function) ? rootUrl :
      rootUrl(urlT, params, getState);
    if (rootUrl) {
      const rootUrlObject = libUrl.parse(rootUrl);
      const urlObject = libUrl.parse(urlT);
      if (!urlObject.host) {
        const urlPath = (rootUrlObject.path ? rootUrlObject.path.replace(/\/$/, "") : "") +
          "/" + (urlObject.path ? urlObject.path.replace(/^\//, "") : "");
        urlT = `${rootUrlObject.protocol}//${rootUrlObject.host}${urlPath}`;
      }
    }
    return urlT;
  }

  function fetch(pathvars, params, getState, dispatch) {
    const urlT = getUrl(pathvars, params, getState);
    const opts = getOptions(urlT, params, getState);
    let id = meta.reducerName || "";
    if (meta.cache && getState !== none) {
      const state = getState();
      const cache = get(state, meta.prefix, meta.reducerName, "cache");
      id += "_" + meta.cache.id(pathvars, params);
      const cacheData = cache && id && cache[id] !== undefined && cache[id];
      if (cacheData) {
        const { expire } = cacheData;
        const isCachedData = expire === false ||
          (expire instanceof Date && expire.valueOf() > (new Date()).valueOf());
        if (isCachedData) {
          return Promise.resolve(cacheData.data);
        }
      }
    }
    const response = meta.fetch(urlT, opts);
    if (meta.cache && dispatch !== none && id) {
      response.then((data)=> {
        dispatch({ type: actionCache, id, data, expire: meta.cache.expire });
      });
    }
    return response;
  }

  /**
   * Fetch data from server
   * @param  {Object}   pathvars    path vars for url
   * @param  {Object}   params      fetch params
   * @param  {Function} getState    helper meta function
  */
  const request = (pathvars, params, getState=none, dispatch=none)=> {
    const response = fetch(pathvars, params, getState, dispatch);
    const result = !meta.validation ? response : response.then(
      data=> new Promise(
        (resolve, reject)=> meta.validation(data,
          err=> err ? reject(err) : resolve(data))));
    let ret = result;
    const responseHandler = get(meta, "holder", "responseHandler");
    if (responseHandler) {
      if (result && result.then) {
        ret = result.then(
          (data)=> {
            const res = responseHandler(null, data);
            if (res === undefined) {
              return data;
            } else {
              return res;
            }
          },
          err=> responseHandler(err)
        );
      } else {
        ret = responseHandler(result);
      }
    }
    ret && ret.catch && ret.catch(none);
    return ret;
  };

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
    return (...middlewareArgs)=> {
      const middlewareParser = get(meta, "holder", "middlewareParser") ||
        defaultMiddlewareArgsParser;
      const { dispatch, getState } = middlewareParser(...middlewareArgs);
      const state = getState();
      const isLoading = get(state, meta.prefix, meta.reducerName, "loading");
      if (isLoading) {
        return;
      }
      const requestOptions = { pathvars, params };
      const prevData =  get(state, meta.prefix, meta.reducerName, "data");
      dispatch({ type: actionFetch, syncing, request: requestOptions });
      const fetchResolverOpts = {
        dispatch,
        getState,
        requestOptions,
        actions: meta.actions,
        prefetch: meta.prefetch
      };
      const result = new Promise((done, fail)=> {
        fetchResolver(0, fetchResolverOpts, (err)=> {
          if (err) {
            pubsub.reject(err);
            return fail(err);
          }
          new Promise((resolve, reject)=> {
            requestHolder.set({
              resolve,
              reject,
              promise: request(pathvars, params, getState, dispatch).then(resolve, reject)
            });
          }).then((d)=> {
            requestHolder.pop();
            const data = meta.transformer(d, prevData, {
              type: actionSuccess, request: requestOptions
            });
            dispatch({
              data,
              origData: d,
              type: actionSuccess,
              syncing: false,
              request: requestOptions
            });
            if (meta.broadcast) {
              meta.broadcast.forEach((type)=> {
                dispatch({ type, data, origData: d, request: requestOptions });
              });
            }
            if (meta.postfetch) {
              meta.postfetch.forEach((postfetch)=> {
                (postfetch instanceof Function) && postfetch({
                  data, getState, dispatch, actions: meta.actions, request: requestOptions
                });
              });
            }
            pubsub.resolve(data);
            done(data);
          }, (error)=> {
            dispatch({ type: actionFail, syncing: false, error, request: requestOptions });
            pubsub.reject(error);
            fail(error);
          });
        });
      });
      result.catch(none);
      return result;
    };
  }

  /*
    Pure rest request
   */
  fn.request = request;

  /**
   * Reset store to initial state
   */
  fn.reset = (mutation)=> {
    const defer = requestHolder.pop();
    defer && defer.reject(new Error("Application abort request"));
    return mutation === "sync" ? { type: actionReset, mutation } : { type: actionReset };
  };

  /**
   * Sync store with server. In server mode works as usual method.
   * If data have already synced, data would not fetch after call this method.
   * @param  {Object} pathvars    path vars for url
   * @param  {Object} params      fetch params
   * @param  {Function} callback) callback execute after end request
   */
  fn.sync = (...args)=> {
    const [pathvars, params, callback] = extractArgs(args);
    const isServer = meta.holder ? meta.holder.server : false;
    return (dispatch, getState)=> {
      const state = getState();
      const store = state[name];
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
  const fnHelperCallback = (memo, func, helpername)=> {
    if (memo[helpername]) {
      throw new Error(
        `Helper name: "${helpername}" for endpoint "${name}" has been already reserved`
      );
    }
    const { sync, call } = (func instanceof Function) ? { call: func } : func;
    memo[helpername] = (...args)=> (dispatch, getState)=> {
      const index = args.length - 1;
      const callbackFn = (args[index] instanceof Function) ? args[index] : none;
      const helpersResult = fastApply(call, { getState, dispatch, actions: meta.actions }, args);
      const result = new Promise((resolve, reject)=> {
        const callback = (err, data)=> {
          err ? reject(err) : resolve(data);
          callbackFn(err, data);
        };
        // If helper alias using async functionality
        if (helpersResult instanceof Function) {
          helpersResult((error, newArgs=[])=> {
            if (error) {
              callback(error);
            } else {
              fastApply(
                sync ? fn.sync : fn, null, newArgs.concat(callback)
              )(dispatch, getState);
            }
          });
        } else {
          // if helper alias is synchronous
          const [pathvars, params] = helpersResult;
          fastApply(
            sync ? fn.sync : fn, null, [pathvars, params, callback]
          )(dispatch, getState);
        }
      });
      result.catch(none);
      return result;
    };
    return memo;
  };

  return Object.keys(helpers).reduce(
    (memo, key)=> fnHelperCallback(memo, helpers[key], key, helpers), fn);
}
