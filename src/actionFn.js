"use strict";

import urlTransform from "./urlTransform";
import isFunction from "lodash/lang/isFunction";
import each from "lodash/collection/each";
import reduce from "lodash/collection/reduce";
import merge from "lodash/object/merge";
import fetchResolver from "./fetchResolver";
import PubSub from "./PubSub";
import fastApply from "fast-apply";
import libUrl from "url";

function none() {}

function extractArgs(args) {
  let pathvars, params={}, callback;
  if (isFunction(args[0])) {
    callback = args[0];
  } else if (isFunction(args[1])) {
    pathvars = args[0];
    callback = args[1];
  } else {
    pathvars = args[0];
    params = args[1];
    callback = args[2] || none;
  }
  return [pathvars, params, callback];
}

function helperCrudFunction(name) {
  return (...args)=> {
    const [pathvars, params, cb] = extractArgs(args);
    return [pathvars, { ...params, method: name }, cb];
  };
}

export const CRUD = reduce(["get", "post", "put", "delete", "patch"],
  (memo, name)=> {
    memo[name] = helperCrudFunction(name);
    return memo;
  }, {});

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
  const { actionFetch, actionSuccess, actionFail, actionReset } = ACTIONS;
  const pubsub = new PubSub();

  /**
   * Fetch data from server
   * @param  {Object}   pathvars    path vars for url
   * @param  {Object}   params      fetch params
   * @param  {Function} getState    helper meta function
  */
  const request = (pathvars, params, getState=none)=> {
    const resultUrlT = urlTransform(url, pathvars);
    const rootUrl = meta.holder ? meta.holder.rootUrl : null;
    let urlT = resultUrlT;
    if (rootUrl) {
      const urlObject = libUrl.parse(urlT);
      if (!urlObject.host) {
        const urlPath = (rootUrl.path ? rootUrl.path.replace(/\/$/, "") : "") +
          "/" + (urlObject.path ? urlObject.path.replace(/^\//, "") : "");
        urlT = `${rootUrl.protocol}//${rootUrl.host}${urlPath}`;
      }
    }
    const globalOptions = !meta.holder ? {} : isFunction(meta.holder.options) ?
      meta.holder.options(urlT, params, getState) : (meta.holder.options);
    const baseOptions = isFunction(options) ? options(urlT, params, getState) : options;
    const opts = merge({}, globalOptions, baseOptions, params);
    const response = meta.fetch(urlT, opts);
    return !meta.validation ? response : response.then(
      (data)=> new Promise(
        (resolve, reject)=> meta.validation(data,
          (err)=> err ? reject(err) : resolve(data))));
  };

  /**
   * Fetch data from server
   * @param  {Object}   pathvars    path vars for url
   * @param  {Object}   params      fetch params
   * @param  {Function} callback)   callback execute after end request
   */
  const fn = (...args)=> {
    const [pathvars, params, callback] = extractArgs(args);
    const syncing = params ? !!params.syncing : false;
    params && delete params.syncing;
    pubsub.push(callback);
    return (dispatch, getState)=> {
      const state = getState();
      const store = state[name];
      const requestOptions = { pathvars, params };
      if (store && store.loading) {
        return;
      }
      dispatch({ type: actionFetch, syncing, request: requestOptions });
      const fetchResolverOpts = {
        dispatch, getState,
        actions: meta.actions,
        prefetch: meta.prefetch
      };

      fetchResolver(0, fetchResolverOpts,
        (err)=> err ? pubsub.reject(err) : request(pathvars, params, getState)
          .then((d)=> {
            const gState = getState();
            const prevData = gState && gState[name] && gState[name].data;
            const data = meta.transformer(d, prevData, {
              type: actionSuccess, request: requestOptions
            });
            dispatch({ type: actionSuccess, syncing: false, data, request: requestOptions });
            each(meta.broadcast,
              (btype)=> dispatch({ type: btype, data, request: requestOptions }));
            each(meta.postfetch,
              (postfetch)=> {
                isFunction(postfetch) && postfetch({
                  data, getState, dispatch, actions: meta.actions, request: requestOptions
                });
              });
            pubsub.resolve(data);
          }, (error)=> {
            dispatch({ type: actionFail, syncing: false, error, request: requestOptions });
            pubsub.reject(error);
          }));
    };
  };

  /*
    Pure rest request
   */
  fn.request = request;

  /**
   * Reset store to initial state
   */
  fn.reset = ()=> ({ type: actionReset });

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

  let helpers = meta.helpers || [];
  if (meta.crud) {
    helpers = { ...CRUD, ...helpers };
  }

  return reduce(helpers, (memo, func, helpername)=> {
    if (memo[helpername]) {
      throw new Error(
        `Helper name: "${helpername}" for endpoint "${name}" has been already reserved`
      );
    }
    const { sync, call } = isFunction(func) ? { call: func } : func;
    memo[helpername] = (...args)=> (dispatch, getState)=> {
      const index = args.length - 1;
      const callback = isFunction(args[index]) ? args[index] : none;
      const helpersResult = fastApply(call, { getState, dispatch, actions: meta.actions }, args);

      // If helper alias using async functionality
      if (isFunction(helpersResult)) {
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
        fastApply(
          sync ? fn.sync : fn, null, helpersResult.concat(callback)
        )(dispatch, getState);
      }
    };
    return memo;
  }, fn);
}
