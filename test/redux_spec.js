"use strict";
/* global describe, it */

import { expect } from "chai";
import reduxApi, { async } from "../src/index.js";
import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import after from "lodash/function/after";

describe("redux", ()=> {
  it("check redux", ()=> {
    const rest = reduxApi({
      test: "/api/url",
    }).use("fetch", (url)=> {
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
    }).use("fetch", (url)=> {
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
      expect(d.data).to.eql("/api/url2");
      expect(store.getState().test.data).to.eql({ data: "/api/url" });
      expect(store.getState().test2.data).to.eql({ data: "/api/url2" });
    });
  });
  it("check async 2", (done)=> {
    const rest = reduxApi({
      test: "/api/url"
    }).use("fetch", (url)=> new Promise((resolve)=> resolve(url)));
    const reducer = combineReducers(rest.reducers);
    const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
    const store = createStoreWithMiddleware(reducer);
    function testAction() {
      return (dispatch, getState)=> {
        async(dispatch, rest.actions.test).then((data)=> {
          expect(getState().test.data).to.eql(data);
          done();
        }).catch(done);
      };
    }
    store.dispatch(testAction());
  });

  it("check double call", (done)=> {
    const rest = reduxApi({
      test: "/test"
    }).use("fetch", (url)=> new Promise((resolve)=> {
      setTimeout(()=> resolve({ url }), 100);
    }));

    const reducer = combineReducers(rest.reducers);
    const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
    const store = createStoreWithMiddleware(reducer);

    const next = after(function() {
      store.dispatch(rest.actions.test.sync((err, data)=> {
        expect(data).to.eql({ url: "/test" });
        done();
      }));
    }, 2);

    store.dispatch(rest.actions.test.sync((err, data)=> {
      expect(data).to.eql({ url: "/test" });
      next();
    }));
    store.dispatch(rest.actions.test.sync((err, data)=> {
      expect(data).to.eql({ url: "/test" });
      next();
    }));
  });

  it("check abort request", (done)=> {
    let store;
    const rest = reduxApi({
      test: "/test"
    }).use("fetch", (url)=> new Promise((resolve)=> {
      setTimeout(()=> {
        resolve({ url });
        expect(store.getState().test).to.eql({
          sync: false, syncing: false, loading: false, data: {},
          error: new Error("Error: Application abort request")
        });
        done();
      }, 100);
    }));

    const reducer = combineReducers(rest.reducers);
    const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
    store = createStoreWithMiddleware(reducer);

    expect(store.getState().test).to.eql(
      { sync: false, syncing: false, loading: false, data: {} }
    );

    store.dispatch(rest.actions.test((err)=> {
      expect(err).to.eql(new Error("Error: Application abort request"));
      expect(store.getState().test).to.eql(
        { sync: false, syncing: false, loading: true, data: {} }
      );
    }));

    expect(store.getState().test).to.eql(
      { sync: false, syncing: false, loading: true, data: {}, error: null }
    );
    store.dispatch(rest.actions.test.reset());

    expect(store.getState().test).to.eql(
      { sync: false, syncing: false, loading: false, data: {} }
    );
  });
});
