"use strict";

/* global describe, it */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}], no-void: 0 */
import { expect } from "chai";
import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import after from "lodash/after";
import reduxApi, { async } from "../src/index";

function storeHelper(rest) {
  const reducer = combineReducers(rest.reducers);
  const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
  return createStoreWithMiddleware(reducer);
}

describe("redux", ()=> {
  it("check redux", ()=> {
    const rest = reduxApi({
      test: "/api/url",
    }).use("fetch", (url)=> {
      return new Promise(resolve=> resolve(url));
    });
    const store = storeHelper(rest);
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
      return new Promise(resolve=> resolve(url));
    });
    const store = storeHelper(rest);
    return async(
      store.dispatch,
      cb=> rest.actions.test(cb),
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
    }).use("fetch", url=> new Promise(resolve=> resolve(url)));
    const store = storeHelper(rest);
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

  it("check custom middlewareParser", ()=> {
    const rest = reduxApi({
      test: "/api/url"
    }).use("fetch",
      url=> new Promise(resolve=> resolve(url)))
    .use("middlewareParser",
      ({ getState, dispatch })=> ({ getState, dispatch }));
    const reducer = combineReducers(rest.reducers);

    const cutsomThunkMiddleware = ({ dispatch, getState })=> next=> (action)=> {
      if (typeof action === "function") {
        return action({ dispatch, getState });
      }
      return next(action);
    };
    const createStoreWithMiddleware = applyMiddleware(cutsomThunkMiddleware)(createStore);
    const store = createStoreWithMiddleware(reducer);
    return new Promise((resolve)=> {
      store.dispatch(rest.actions.test(resolve));
    }).then(()=> {
      expect(store.getState().test.data).to.eql({ data: "/api/url" });
    });
  });

  it("check double call", (done)=> {
    const rest = reduxApi({
      test: "/test"
    }).use("fetch", url=> new Promise((resolve)=> {
      setTimeout(()=> resolve({ url }), 100);
    }));

    const expectedAction = [
      {
        type: "@@redux-api@test",
        syncing: true,
        request: { pathvars: undefined, params: {} }
      },
      {
        data: { url: "/test" },
        origData: { url: "/test" },
        type: "@@redux-api@test_success",
        syncing: false,
        request: { pathvars: undefined, params: {} }
      }
    ];
    const reducer = combineReducers({
      ...rest.reducers,
      debug(state={}, action) {
        if (!/^@@redux\//.test(action.type)) {
          const exp = expectedAction.shift();
          expect(action).to.eql(exp);
        }
        return state;
      }
    });
    const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
    const store = createStoreWithMiddleware(reducer);

    const next = after(2, function() {
      store.dispatch(rest.actions.test.sync((err, data)=> {
        expect(data).to.eql({ url: "/test" });
        expect(expectedAction).to.have.length(0);
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
    }).use("fetch", url=> new Promise((resolve)=> {
      setTimeout(()=> {
        resolve({ url });
        expect(store.getState().test).to.eql({
          sync: false,
          syncing: false,
          loading: false,
          data: {},
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

    const store = storeHelper(rest);
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
  it("check reset \"sync\"", ()=> {
    const rest = reduxApi({
      test: "/api/url",
    }).use("fetch", (url)=> {
      return new Promise(resolve=> resolve(url));
    });
    const store = storeHelper(rest);
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
      return new Promise(resolve=> resolve(url));
    });
    const store = storeHelper(rest);
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
        request: { pathvars: (void 0), params: (void 0) }
      }],
      ["/api/test2", "/api/test1", {
        type: "@@redux-api@test1_success",
        request: { pathvars: (void 0), params: (void 0) }
      }],
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
    }).use("fetch", url=> new Promise(resolve=> resolve(url)));

    const store = storeHelper(rest);
    return store.dispatch(rest.actions.test1())
      .then(()=> store.dispatch(rest.actions.test2()))
      .then(()=> expect(expectedArgs).to.eql(["none"]));
  });

  it("multiple endpoints", function() {
    const fetch = url=> Promise.resolve(url);

    const expectedData = [
      [(void 0), (void 0)],
      ["/test1", {}]
    ];
    const actualData = [];

    const rest1 = reduxApi({
      test: {
        url: "/test1",
        transformer(data, prevData) {
          actualData.push([data, prevData]);
          return data ? { data } : {};
        }
      }
    }, { prefix: "r1" }).use("fetch", fetch);

    const rest2 = reduxApi({
      test: "/test2"
    }, { prefix: "r2" }).use("fetch", fetch);

    const reducer = combineReducers({
      r1: combineReducers(rest1.reducers),
      r2: combineReducers(rest2.reducers)
    });

    const expectedArgs = [
      ["@@redux-api@r1test", {
        r1: {
          test: {
            sync: false,
            syncing: false,
            loading: true,
            data: {},
            error: null
          }
        },
        r2: {
          test: {
            sync: false,
            syncing: false,
            loading: false,
            data: {}
          }
        }
      }],
      ["@@redux-api@r1test_success", {
        r1: {
          test: {
            sync: true,
            syncing: false,
            loading: false,
            data: { data: "/test1" },
            error: null
          }
        },
        r2: {
          test: {
            sync: false,
            syncing: false,
            loading: false,
            data: {}
          }
        }
      }],
      ["@@redux-api@r2test", {
        r1: {
          test: {
            data: { data: "/test1" },
            error: null,
            loading: false,
            sync: true,
            syncing: false
          }
        },
        r2: {
          test: {
            data: {},
            error: null,
            loading: true,
            sync: false,
            syncing: false
          }
        }
      }],
      ["@@redux-api@r2test_success", {
        r1: {
          test: {
            sync: true,
            syncing: false,
            loading: false,
            data: { data: "/test1" },
            error: null
          }
        },
        r2: {
          test: {
            sync: true,
            syncing: false,
            loading: false,
            data: { data: "/test2" },
            error: null
          }
        }
      }],
    ];
    const receiveArgs = [];
    function midleware({ getState }) {
      return next=> (action)=> {
        const result = next(action);
        if (typeof action !== "function") {
          receiveArgs.push([action.type, getState()]);
        }
        return result;
      };
    }

    const createStoreWithMiddleware = applyMiddleware(midleware, thunk)(createStore);
    const store = createStoreWithMiddleware(reducer);


    return store.dispatch(rest1.actions.test())
      .then(()=> store.dispatch(rest2.actions.test()))
      .then(()=> {
        expect(receiveArgs).to.have.length(4);
        expect(receiveArgs[0]).to.eql(expectedArgs[0]);
        expect(receiveArgs[1]).to.eql(expectedArgs[1]);
        expect(receiveArgs[2]).to.eql(expectedArgs[2]);
        expect(receiveArgs[3]).to.eql(expectedArgs[3]);

        expect(actualData).to.have.length(2);
        expect(actualData[0]).to.eql(expectedData[0]);
        expect(actualData[1]).to.eql(expectedData[1]);
      });
  });


  it("check cache options", function() {
    let requestCount = 0;
    const rest = reduxApi({
      test: {
        url: "/api/:id1/:id2",
        cache: true
      }
    }).use("fetch", (url)=> {
      requestCount+=1;
      return new Promise(resolve=> resolve(url));
    });
    const store = storeHelper(rest);
    return store.dispatch(rest.actions.test({ id1: 1, id2: 2 }))
      .then(()=> {
        const state = store.getState();
        expect(state.test.cache).to.eql({ "test_id1=1;id2=2;": "/api/1/2" });
        return store.dispatch(rest.actions.test({ id1: 1, id2: 2 }));
      })
      .then(()=> {
        expect(requestCount).to.eql(1);
      });
  });
});
