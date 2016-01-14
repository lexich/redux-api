"use strict";

function fn(val) {
  return val;
}

/**
 * Reducer contructor
 * @param  {Object}   initialState default initial state
 * @param  {Object}   actions      actions map
 * @param  {Function} transformer  transformer function
 * @return {Function}              reducer function
 */
export default function reducerFn(initialState, actions={}, transformer=fn) {
  const { actionFetch, actionSuccess, actionFail, actionReset } = actions;
  return (state=initialState, action)=> {
    switch (action.type) {
      case actionFetch:
        return {
          ...state,
          loading: true,
          error: null,
          syncing: !!action.syncing
        };
      case actionSuccess:
        return {
          ...state,
          loading: false,
          sync: true,
          syncing: false,
          error: null,
          data: transformer(action.data, state.data, action)
        };
      case actionFail:
        return {
          ...state,
          loading: false,
          error: action.error,
          syncing: false
        };
      case actionReset:
        return { ...initialState };
      default:
        return state;
    }
  };
}
