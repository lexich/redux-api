"use strict";
/* global describe, it */

import { expect } from "chai";
import reduxApi, { async } from "../src/index.js";
import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";

describe("redux", ()=> {
  it("check redux", ()=> {
    const rest = reduxApi({
      test: "/api/url",
    }).init((url)=> {
      return new Promise((resolve)=> resolve(url));
    });
    const reducer = combineReducers(rest.reducers);
    const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
    const store = createStoreWithMiddleware(reducer);
    return new Promise((resolve)=> {
      store.dispatch(rest.actions.test(resolve));
    }).then(()=> {
      expect(store.getState().test.data).to.eql({ data: "/api/url" });
    });
  });
  it("check async function with redux", ()=> {
    const rest = reduxApi({
      test: "/api/url",
      test2: "/api/url2",
    }).init((url)=> {
      return new Promise((resolve)=> resolve(url));
    });
    const reducer = combineReducers(rest.reducers);
    const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
    const store = createStoreWithMiddleware(reducer);

    return async(
      store.dispatch,
      (cb)=> rest.actions.test(cb),
      rest.actions.test2
    ).then((d)=> {
      expect(d.data).to.eql({ data: "/api/url2" });
      expect(store.getState().test.data).to.eql({ data: "/api/url" });
      expect(store.getState().test2.data).to.eql({ data: "/api/url2" });
    });
  });
});
