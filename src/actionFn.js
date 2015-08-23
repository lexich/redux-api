"use strict";
import urlTransform from "./urlTransform";
export default function actionFn(url, name, options, ACTIONS={}, fetch) {
  const {actionFetch, actionSuccess, actionFail, actionReset} = ACTIONS;
  const fn = (pathvars, params={})=> (dispatch, getState)=> {
    const state = getState();
    const store = state[name];
    if (store.loading) { return; }
    dispatch({ type: actionFetch });
    const _url = urlTransform(url, pathvars);
    const pre = options && options.pre ? options.pre : function(r) { return r; };
    const opts = pre({ ...options, ...params });
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
