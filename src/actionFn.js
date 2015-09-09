"use strict";

import urlTransform from "./urlTransform";
import isFunction from "lodash/lang/isFunction";

export default function actionFn(url, name, options, ACTIONS={}, fetchAdapter) {
  const {actionFetch, actionSuccess, actionFail, actionReset} = ACTIONS;
  const fn = (pathvars, params={}, info={})=> (dispatch, getState)=> {
    const state = getState();
    const store = state[name];
    if (store.loading) { return; }
    dispatch({ type: actionFetch, syncing: !!info.syncing });
    const _url = urlTransform(url, pathvars);
    const baseOptions = isFunction(options) ? options(_url, params) : options;
    const opts = { ...baseOptions, ...params };
    fetchAdapter(_url, opts)
      .then((data)=> dispatch({
        type: actionSuccess,
        syncing: false,
        data
      }))
      .catch((error)=> dispatch({
        type: actionFail,
        syncing: false,
        error
      }));
  };
  fn.reset = ()=> ({type: actionReset});
  fn.sync = (pathvars, params)=> (dispatch, getState)=> {
    const state = getState();
    const store = state[name];
    if (store.sync) return;
    return fn(pathvars, params, {syncing: true})(dispatch, getState);
  };
  return fn;
}
