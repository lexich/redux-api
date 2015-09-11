"use strict";

import urlTransform from "./urlTransform";
import isFunction from "lodash/lang/isFunction";

export default function actionFn(url, name, options, ACTIONS={}, fetchAdapter) {
  const {actionFetch, actionSuccess, actionFail, actionReset} = ACTIONS;
  const fn = (pathvars, params={}, callback, info={})=> (dispatch, getState)=> {
    const state = getState();
    const store = state[name];
    if (store.loading) {
      callback && callback("request still loading");
      return;
    }
    dispatch({ type: actionFetch, syncing: !!info.syncing });
    const _url = urlTransform(url, pathvars);
    const baseOptions = isFunction(options) ? options(_url, params) : options;
    const opts = { ...baseOptions, ...params };
    fetchAdapter(_url, opts)
      .then((data)=> {
        dispatch({ type: actionSuccess, syncing: false, data });
        callback && callback(null, data);
      })
      .catch((error)=> {
        dispatch({ type: actionFail, syncing: false, error });
        callback && callback(error);
      });
  };
  fn.reset = ()=> ({type: actionReset});
  fn.sync = (pathvars, params, callback)=> (dispatch, getState)=> {
    const state = getState();
    const store = state[name];
    if (!state["@redux-api"].server && store.sync) {
      callback && callback();
      return;
    }
    return fn(pathvars, params, callback, {syncing: true})(dispatch, getState);
  };
  return fn;
}
