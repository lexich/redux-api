"use strict";

/* eslint no-case-declarations: 0 */
import { setExpire } from "./utils/cache";
import { responseTransform } from "./transformers";

/**
 * Reducer contructor
 * @param  {Object}   initialState default initial state
 * @param  {Object}   actions      actions map
 * @param  {Function} reducer      custom reducer function
 * @return {Function}              reducer function
 */
export default function reducerFn(initialState, actions = {}, reducer) {
  const {
    actionFetch,
    actionSuccess,
    actionFail,
    actionReset,
    actionCache,
    actionAbort
  } = actions;
  return (state = initialState, action) => {
    const request = action.request || {};
    const data = action.data || {};
    switch (action.type) {
      case actionFetch:
        return responseTransform({
          ...state,
          api: {
            ...state.api,
            request,
            loading: true,
            error: null,
            syncing: !!action.syncing
          }
        });
      case actionSuccess:
        return responseTransform({
          ...data,
          api: {
            ...state.api,
            ...data.api,
            loading: false,
            sync: true,
            syncing: false,
            error: null
          }
        });
      case actionFail:
        return responseTransform({
          ...state,
          api: {
            ...state.api,
            loading: false,
            error: action.error,
            syncing: false
          }
        });
      case actionReset:
        const { mutation } = action;
        return mutation === "sync"
          ? responseTransform({
              ...state,
              api: {
                ...state.api,
                request: null,
                sync: false
              }
            })
          : { ...initialState };
      case actionAbort:
        return responseTransform({
          ...state,
          api: {
            ...state.api,
            request: null,
            loading: false,
            syncing: false,
            error: action.error
          }
        });
      case actionCache:
        const { id } = action;
        const cacheExpire = state.cache[id] ? state.cache[id].expire : null;
        const expire = setExpire(action.expire, cacheExpire);
        return {
          ...state,
          cache: { ...state.cache, [id]: { expire, data } }
        };
      default:
        return reducer ? reducer(state, action) : state;
    }
  };
}
