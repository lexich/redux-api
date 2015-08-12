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
    const opts = { ...options, ...params };
    fetch(_url, opts)
      .then((resp)=> resp.json())
      .then((data)=> dispatch({ type: actionSuccess, data }))
      .catch((error)=> dispatch({ type: actionFail, error }));
  };
  fn.reset = ()=> ({type: actionReset});
  return fn;
}
