"use strict";
export default function reducerFn(initialState, actions={}, transformer=(d)=> d) {
  const {actionFetch, actionSuccess, actionFail, actionReset} = actions;
  return (state=initialState, action)=> {
    switch (action.type) {
    case actionFetch:
      return {...state, loading: true, error: null};
    case actionSuccess:
      return {...state, loading: false, error: null, data: transformer(action.data)};
    case actionFail:
      return {...state, loading: false, error: action.error};
    case actionReset:
      return {...initialState};
    default:
      return state;
    }
  };
}
