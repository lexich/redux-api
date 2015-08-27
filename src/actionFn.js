"use strict";
import urlTransform from "./urlTransform";
import isFunction from "lodash/lang/isFunction";

export default function actionFn(url, name, options, ACTIONS={}, fetch) {
  const {actionFetch, actionSuccess, actionFail, actionReset} = ACTIONS;
  const fn = (pathvars, params={})=> (dispatch, getState)=> {
    const state = getState();
    const store = state[name];
    if (store.loading) { return; }
    dispatch({ type: actionFetch });
    const _url = urlTransform(url, pathvars);
    const opts = { ...options, ...params };
    if (opts.header) {
      opts.header = isFunction(opts.header) ? opts.header() : opts.header;
    }
    if (opts.body) {
      opts.body = isFunction(opts.body) ? opts.body() : opts.body;
    }
    fetch(_url, opts)
      .then((resp)=> resp.json())
      .then((data)=> dispatch({ type: actionSuccess, data }))
      .catch((error)=> dispatch({ type: actionFail, error }));
  };
  fn.reset = ()=> ({type: actionReset});
  fn.sync = (pathvars, params)=> (dispatch, getState)=> {
    const state = getState();
    const store =state[name];
    if (store.sync) return;
    return fn(pathvars, params)(dispatch, getState);
  };
  return fn;
}
