"use strict";

import urlTransform from "./urlTransform";
import isFunction from "lodash/lang/isFunction";
import each from "lodash/collection/each";

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
   * @param  {Object}   info        addition system information for internal usage
   */
  const fn = (pathvars, params={}, callback, info={})=> (dispatch, getState)=> {
    const state = getState();
    const store = state[name];
    if (store && store.loading) {
      callback && callback("request still loading");
      return;
    }
    dispatch({ type: actionFetch, syncing: !!info.syncing });
    const _url = urlTransform(url, pathvars);
    const baseOptions = isFunction(options) ? options(_url, params, getState) : options;
    const opts = { ...baseOptions, ...params };

    meta.holder.fetch(_url, opts)
      .then((data)=> {
        dispatch({ type: actionSuccess, syncing: false, data });
        each(meta.broadcast, (btype)=> dispatch({type: btype, data}));
        callback && callback(null, data);
      })
      .catch((error)=> {
        dispatch({ type: actionFail, syncing: false, error });
        callback && callback(error);
      });
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
  fn.sync = (pathvars, params, callback)=> (dispatch, getState)=> {
    const state = getState();
    const store = state[name];
    if (!meta.holder.server && store && store.sync) {
      callback && callback();
      return;
    }
    return fn(pathvars, params, callback, {syncing: true})(dispatch, getState);
  };
  return fn;
}
