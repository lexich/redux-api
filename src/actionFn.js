"use strict";

import urlTransform from "./urlTransform";
import isFunction from "lodash/lang/isFunction";
import each from "lodash/collection/each";
import fetchResolver from "./fetchResolver";

function none() {}

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
  const {actionFetch, actionSuccess, actionFail, actionReset} = ACTIONS;

  /**
   * Fetch data from server
   * @param  {Object}   pathvars    path vars for url
   * @param  {Object}   params      fetch params
   * @param  {Function} callback)   callback execute after end request
   */
  const fn = (pathvars, params={}, callback=none)=> {
    const urlT = urlTransform(url, pathvars);
    const syncing = params ? !!params.syncing : false;
    params && delete params.syncing;
    return (dispatch, getState)=> {
      const state = getState();
      const store = state[name];
      if (store && store.loading) {
        callback("request still loading");
        return;
      }

      dispatch({ type: actionFetch, syncing});
      const baseOptions = isFunction(options) ? options(urlT, params, getState) : options;
      const opts = { ...baseOptions, ...params };

      const fetchResolverOpts = {
        dispatch, getState,
        actions: meta.actions,
        prefetch: meta.prefetch
      };

      fetchResolver(0, fetchResolverOpts,
        (err)=> err ? callback(err) : meta.holder.fetch(urlT, opts)
          .then((data)=> {
            dispatch({ type: actionSuccess, syncing: false, data });
            each(meta.broadcast, (btype)=> dispatch({type: btype, data}));
            callback(null, data);
          })
          .catch((error)=> {
            dispatch({ type: actionFail, syncing: false, error });
            callback(error);
          }));
    };
  };
  /**
   * Reset store to initial state
   */
  fn.reset = ()=> ({type: actionReset});
  /**
   * Sync store with server. In server mode works as usual method.
   * If data have already synced, data would not fetch after call this method.
   * @param  {Object} pathvars    path vars for url
   * @param  {Object} params      fetch params
   * @param  {Function} callback) callback execute after end request
   */
  fn.sync = (pathvars, params, callback=none)=> (dispatch, getState)=> {
    const state = getState();
    const store = state[name];
    if (!meta.holder.server && store && store.sync) {
      callback();
      return;
    }
    const modifyParams = {...params, syncing: true};
    return fn(pathvars, modifyParams, callback)(dispatch, getState);
  };
  return fn;
}
