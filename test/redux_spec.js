"use strict";
/* global describe, it */

import { expect } from "chai";
import reduxApi, { async } from "../src/index.js";
import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import after from "lodash/after";

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

    const next = after(2, function() {
      store.dispatch(rest.actions.test.sync((err, data)=> {
        expect(data).to.eql({ url: "/test" });
        done();
      }));
    });

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
    /* eslint prefer-const: 0 */
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

  it("check reducer option", ()=> {
    let context;
    const rest = reduxApi({
      external: "/external",
      test: {
        url: "/test",
        reducer(state, action) {
          context = this;
          if (action.type === this.events.external.actionSuccess) {
            return { ...state, data: action.data };
          } else {
            return state;
          }
        }
      }
    }).use("fetch", (url)=> {
      return new Promise((resolve)=> {
        resolve({ url });
      });
    });

    const reducer = combineReducers(rest.reducers);
    const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
    const store = createStoreWithMiddleware(reducer);
    expect(store.getState()).to.eql({
      external: { sync: false, syncing: false, loading: false, data: {} },
      test: { sync: false, syncing: false, loading: false, data: {} }
    });

    return new Promise((done)=> {
      store.dispatch(rest.actions.external(done));
    }).then((err)=> {
      expect(err).to.not.exist;
      expect(context).to.include.keys(
        "actions",
        "reducers",
        "events"
      );
      expect(store.getState()).to.eql({
        external: {
          sync: true,
          syncing: false,
          loading: false,
          data: { url: "/external" },
          error: null
        },
        test: {
          sync: false,
          syncing: false,
          loading: false,
          data: { url: "/external" }
        }
      });
    });
  });
  it("check reset 'sync'", ()=> {
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
      expect(store.getState().test).to.eql({
        sync: true,
        syncing: false,
        loading: false,
        data: { data: "/api/url" },
        error: null
      });
      store.dispatch(rest.actions.test.reset("sync"));
      expect(store.getState().test).to.eql({
        sync: false,
        syncing: false,
        loading: false,
        data: { data: "/api/url" },
        error: null
      });
    });
  });
  it("check result of dispatch", function() {
    const rest = reduxApi({
      test: "/api/url",
    }).use("fetch", (url)=> {
      return new Promise((resolve)=> resolve(url));
    });
    const reducer = combineReducers(rest.reducers);
    const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
    const store = createStoreWithMiddleware(reducer);
    const result = store.dispatch(rest.actions.test());
    expect(result instanceof Promise).to.be.true;
    return result.then((data)=> {
      expect(data).to.eql({ data: "/api/url" });
    });
  });
  it("check all arguments for transformer", function() {
    const expectedArgs = [
      [(void 0), (void 0), (void 0)],
      ["/api/test1", (void 0), {
        type: "@@redux-api@test1_success",
        request: { pathvars: (void 0), params: (void 0)
      } }],
      ["/api/test2", "/api/test1", {
        type: "@@redux-api@test1_success",
        request: { pathvars: (void 0), params: (void 0)
      } }],
      "none"
    ];
    const rest = reduxApi({
      test1: {
        url: "/api/test1",
        transformer(data, prevData, opts) {
          expect([data, prevData, opts]).to.eql(expectedArgs.shift());
          return data;
        }
      },
      test2: {
        url: "/api/test2",
        reducerName: "test1",
        transformer(data, prevData, opts) {
          expect([data, prevData, opts]).to.eql(expectedArgs.shift());
          return data;
        }
      }
    }).use("fetch", (url)=> new Promise((resolve)=> resolve(url)));

    const reducer = combineReducers(rest.reducers);
    const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
    const store = createStoreWithMiddleware(reducer);
    return store.dispatch(rest.actions.test1())
      .then(()=> store.dispatch(rest.actions.test2()))
      .then(()=> expect(expectedArgs).to.eql(["none"]));
  });
});
