"use strict";
import urlTransform from "./urlTransform";
export default function actionFn(url, name, options, ACTIONS={}, fetch) {
  const {actionFetch, actionSuccess, actionFail, actionReset} = ACTIONS;
  const fn = (pathvars, params={}, info={})=> (dispatch, getState)=> {
    const state = getState();
    const store = state[name];
    if (store.loading) { return; }
    dispatch({ type: actionFetch, syncing: !!info.syncing });
    const _url = urlTransform(url, pathvars);
    const opts = { ...options, ...params };
    fetch(_url, opts)
      .then((resp)=> resp.json())
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
