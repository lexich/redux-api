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

function none() {}

describe("redux", () => {
  it("check redux", () => {
    const rest = reduxApi({
      test: "/api/url"
    }).use("fetch", url => {
      return new Promise(resolve => resolve(url));
    });
    const store = storeHelper(rest);
    return new Promise(resolve => {
      store.dispatch(rest.actions.test(resolve));
    }).then(() => {
      expect(store.getState().test.data).to.eql("/api/url");
    });
  });
  it("check async function with redux", () => {
    const rest = reduxApi({
      test: "/api/url",
      test2: "/api/url2"
    }).use("fetch", url => {
      return new Promise(resolve => resolve(url));
    });
    const store = storeHelper(rest);
    return async(
      store.dispatch,
      cb => rest.actions.test(cb),
      rest.actions.test2
    ).then(d => {
      expect(d.data).to.eql("/api/url2");
      expect(store.getState().test.data).to.eql("/api/url");
      expect(store.getState().test2.data).to.eql("/api/url2");
    });
  });
  it("check async 2", done => {
    const rest = reduxApi({
      test: "/api/url"
    }).use("fetch", url => new Promise(resolve => resolve(url)));
    const store = storeHelper(rest);
    function testAction() {
      return (dispatch, getState) => {
        async(dispatch, rest.actions.test)
          .then(data => {
            expect(getState().test.data).to.eql(data.data);
            done();
          })
          .catch(done);
      };
    }
    store.dispatch(testAction());
  });

  it("check custom middlewareParser", () => {
    const rest = reduxApi({
      test: "/api/url"
    })
      .use("fetch", url => new Promise(resolve => resolve(url)))
      .use("middlewareParser", ({ getState, dispatch }) => ({
        getState,
        dispatch
      }));
    const reducer = combineReducers(rest.reducers);

    const cutsomThunkMiddleware = ({
      dispatch,
      getState
    }) => next => action => {
      if (typeof action === "function") {
        return action({ dispatch, getState });
      }
      return next(action);
    };
    const createStoreWithMiddleware = applyMiddleware(cutsomThunkMiddleware)(
      createStore
    );
    const store = createStoreWithMiddleware(reducer);
    return new Promise(resolve => {
      store.dispatch(rest.actions.test(resolve));
    }).then(
      () => {
        expect(store.getState().test.data).to.eql("/api/url");
      },
      err => expect(null).to.eql(err)
    );
  });

  it("check double call", done => {
    const rest = reduxApi({
      test: "/test"
    }).use(
      "fetch",
      url =>
        new Promise(resolve => {
          setTimeout(() => resolve({ url }), 100);
        })
    );

    // eslint-disable-next-line no-unused-vars
    const expectedAction = [
      {
        type: "@@redux-api@test",
        api: {
          syncing: true,
          request: { pathvars: undefined, params: {} }
        }
      },
      {
        data: { url: "/test" },
        origData: { url: "/test" },
        type: "@@redux-api@test_success",
        api: {
          syncing: false,
          request: { pathvars: undefined, params: {} }
        }
      }
    ];
    const reducer = combineReducers({
      ...rest.reducers,
      // eslint-disable-next-line no-unused-vars
      debug(state = {}, action) {
        /* TODO:
        if (!/^@@redux\//.test(action.type)) {
          const exp = expectedAction.shift();
          expect(action).to.eql(exp);
        }
        */
        return state;
      }
    });
    const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
    const store = createStoreWithMiddleware(reducer);

    const next = after(2, function() {
      store.dispatch(
        rest.actions.test.sync((err, data) => {
          expect(data).to.eql({ url: "/test" });
          // TODO: expect(expectedAction).to.have.length(0);
          done();
        })
      );
    });

    store
      .dispatch(
        rest.actions.test.sync((err, data) => {
          expect(data).to.eql({ url: "/test" });
          next();
        })
      )
      .catch(none);
    store
      .dispatch(
        rest.actions.test.sync((err, data) => {
          expect(data).to.eql({ url: "/test" });
          next();
        })
      )
      .catch(none);
  });

  it("check abort request", () => {
    const timeoutPromise = (url, timeout) =>
      new Promise(resolve => setTimeout(() => resolve(url), timeout));

    const rest = reduxApi({
      test: "/test"
    }).use("fetch", url => timeoutPromise(url, 100));

    const reducer = combineReducers(rest.reducers);
    const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
    const store = createStoreWithMiddleware(reducer);

    expect({
      api: {
        empty: true,
        sync: false,
        syncing: false,
        loading: false,
        request: null
      }
    }).to.eql(store.getState().test, "Initial state");
    const retAborting = store.dispatch(rest.actions.test()).then(
      () => expect(false).to.eql(true, "Should be error"),
      err => {
        expect(err).to.eql(new Error("Error: Application abort request"));
        return true;
      }
    );
    expect({
      api: {
        empty: true,
        sync: false,
        syncing: false,
        loading: true,
        error: null,
        request: {
          params: undefined,
          pathvars: undefined
        }
      }
    }).to.eql(
      store.getState().test,
      "State doesn't change, request in process"
    );
    store.dispatch(rest.actions.test.reset());
    expect({
      api: {
        empty: true,
        sync: false,
        syncing: false,
        loading: false,
        request: null
      }
    }).to.eql(store.getState().test, "State after reset");
    return retAborting;
  });

  it("check reducer option", () => {
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
    }).use("fetch", url => {
      return new Promise(resolve => {
        resolve({ url });
      });
    });

    const store = storeHelper(rest);
    expect(store.getState()).to.eql({
      external: {
        api: {
          empty: true,
          sync: false,
          syncing: false,
          loading: false,
          request: null
        }
      },
      test: {
        api: {
          empty: true,
          sync: false,
          syncing: false,
          loading: false,
          request: null
        }
      }
    });

    return new Promise(done => {
      store.dispatch(rest.actions.external(done));
    }).then(err => {
      expect(err).to.not.exist;
      expect(context).to.include.keys("actions", "reducers", "events");
    });
  });
  it('check reset "sync"', () => {
    const rest = reduxApi({
      test: "/api/url"
    }).use("fetch", url => {
      return new Promise(resolve => resolve(url));
    });
    const store = storeHelper(rest);
    return new Promise(resolve => {
      store.dispatch(rest.actions.test(resolve));
    }).then(() => {
      expect(store.getState().test).to.eql({
        api: {
          empty: false,
          sync: true,
          syncing: false,
          loading: false,
          request: {
            params: {},
            pathvars: undefined
          },
          error: null
        },
        data: "/api/url"
      });
      store.dispatch(rest.actions.test.reset("sync"));
      expect(store.getState().test).to.eql({
        api: {
          empty: false,
          request: null,
          sync: false,
          syncing: false,
          loading: false,
          error: null
        },
        data: "/api/url"
      });
    });
  });
  it("check result of dispatch", function() {
    const rest = reduxApi({
      test: "/api/url"
    }).use("fetch", url => {
      return new Promise(resolve => resolve(url));
    });
    const store = storeHelper(rest);
    const result = store.dispatch(rest.actions.test());
    expect(result instanceof Promise).to.be.true;
    return result.then(({ data }) => {
      expect(data).to.eql("/api/url");
    });
  });
  it("check all arguments for transformer", function() {
    const expectedArgs = [
      [void 0, void 0, void 0],
      [
        "/api/test1",
        void 0,
        {
          type: "@@redux-api@test1_success",
          request: { pathvars: void 0, params: void 0 }
        }
      ],
      [
        "/api/test2",
        "/api/test1",
        {
          type: "@@redux-api@test1_success",
          request: { pathvars: void 0, params: void 0 }
        }
      ],
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
        // eslint-disable-next-line no-unused-vars
        transformer(data, prevData, opts) {
          // TODO: expect([data, prevData, opts]).to.eql(expectedArgs.shift());
          return data;
        }
      }
    }).use("fetch", url => new Promise(resolve => resolve(url)));

    const store = storeHelper(rest);
    return store
      .dispatch(rest.actions.test1())
      .then(() => store.dispatch(rest.actions.test2()));
    // TODO: .then(() => expect(expectedArgs).to.eql(["none"]));
  });

  /*
    TODO: multiple endpoints
  it("multiple endpoints", function() {
    const fetch = url => Promise.resolve(url);

    const expectedData = [[void 0, void 0], ["/test1", {}]];
    const actualData = [];

    const rest1 = reduxApi(
      {
        test: {
          url: "/test1",
          transformer(data, prevData) {
            actualData.push([data, prevData]);
            return data || {};
          }
        }
      },
      { prefix: "r1" }
    ).use("fetch", fetch);

    const rest2 = reduxApi(
      {
        test: "/test2"
      },
      { prefix: "r2" }
    ).use("fetch", fetch);

    const reducer = combineReducers({
      r1: combineReducers(rest1.reducers),
      r2: combineReducers(rest2.reducers)
    });

    const expectedArgs = [
      [
        "@@redux-api@r1test",
        {
          r1: {
            test: {
              api: {
                empty: true,
                sync: false,
                syncing: false,
                loading: true,
                error: null,
                request: {
                  params: undefined,
                  pathvars: undefined
                }
              }
            }
          },
          r2: {
            test: {
              api: {
                empty: true,
                sync: false,
                syncing: false,
                loading: false,
                request: null
              }
            }
          }
        }
      ],
      [
        "@@redux-api@r1test_success",
        {
          r1: {
            test: {
              api: {
                empty: false,
                sync: true,
                syncing: false,
                loading: false,                
                error: null,
                request: {
                  params: undefined,
                  pathvars: undefined
                }
              },
              data: "/test1"
            }
          },
          r2: {
            test: {
              api: {
                empty: true,
                sync: false,
                syncing: false,
                loading: false,
                request: null,                
              }
            }
          }
        }
      ],
      [
        "@@redux-api@r2test",
        {
          r1: {
            test: {
              api: {
                empty: false,
                sync: true,
                syncing: false,
                loading: false,                
                error: null,
                request: {
                  params: undefined,
                  pathvars: undefined
                }
              }
            }
          },
          r2: {
            test: {
              api: {
                empty: true,
                sync: false,
                syncing: false,
                loading: true,                
                error: null,
                request: {
                  params: undefined,
                  pathvars: undefined
                }
              }
            }
          }
        }
      ],
      [
        "@@redux-api@r2test_success",
        {
          r1: {
            test: {
              api: {
                empty: false,
                sync: true,
                syncing: false,
                loading: false,                
                error: null,
                request: {
                  params: undefined,
                  pathvars: undefined
                }
              },
              data: "/test1"
            }
          },
          r2: {
            test: {
              api: {
                empty: false,
                sync: true,
                syncing: false,
                loading: false,               
                error: null,
                request: {
                  params: undefined,
                  pathvars: undefined
                }
              },
              data: "/test2"
            }
          }
        }
      ]
    ];
    const receiveArgs = [];
    function midleware({ getState }) {
      return next => action => {
        const result = next(action);
        if (typeof action !== "function") {
          receiveArgs.push([action.type, getState()]);
        }
        return result;
      };
    }

    const createStoreWithMiddleware = applyMiddleware(midleware, thunk)(
      createStore
    );
    const store = createStoreWithMiddleware(reducer);

    return store
      .dispatch(rest1.actions.test())
      .then(() => store.dispatch(rest2.actions.test()))
      .then(() => {
        expect(receiveArgs).to.have.length(4);
        expect(expectedArgs[0]).to.eql(receiveArgs[0]);
        expect(expectedArgs[1]).to.eql(receiveArgs[1]);
        expect(expectedArgs[2]).to.eql(receiveArgs[2]);
        expect(expectedArgs[3]).to.eql(receiveArgs[3]);

        expect(actualData).to.have.length(2);
        expect(actualData[0]).to.eql(expectedData[0]);
        expect(actualData[1]).to.eql(expectedData[1]);
      });
  });  
  */

  it("check double call crud alias", function() {
    let fetchCounter = 0;
    const rest = reduxApi({
      test: {
        url: "/api/test",
        crud: true
      }
    }).use("fetch", url => {
      fetchCounter += 1;
      return new Promise(resolve => resolve(url));
    });

    const store = storeHelper(rest);
    let counter = 0;
    function callback() {
      counter += 1;
    }

    return store
      .dispatch(rest.actions.test.get(callback))
      .then(() => store.dispatch(rest.actions.test.put(callback)))
      .then(() => {
        expect(fetchCounter).to.eql(2, "fetch should be perform twice");
        expect(counter).to.eql(2, "call should be perform twice");
      });
  });

  it("check abort", () => {
    const rest = reduxApi({
      test: "/api/url"
    }).use("fetch", url => {
      return new Promise(resolve => setTimeout(() => resolve(url), 10));
    });
    const store = storeHelper(rest);

    const ret1 = new Promise((resolve, reject) =>
      store.dispatch(rest.actions.test()).then(
        () => reject("Abort should generate error"),
        err => {
          try {
            expect("Application abort request").to.eql(err.message);
            expect({
              api: {
                empty: true,
                sync: false,
                syncing: false,
                loading: false,
                request: {
                  params: undefined,
                  pathvars: undefined
                },
                error: err
              }
            }).to.eql(store.getState().test);
            resolve();
          } catch (e) {
            reject(e);
          }
        }
      )
    );

    store.dispatch(rest.actions.test.abort());
    const ret2 = store.dispatch(rest.actions.test());

    return Promise.all([ret1, ret2]).then(() => {
      expect(store.getState().test.data).to.eql("/api/url");
    });
  });

  /*
    TODO: check force
  it("check force", () => {
    const rest = reduxApi({
      test: "/api/url"
    }).use("fetch", url => {
      return new Promise(resolve => setTimeout(() => resolve(url), 10));
    });
    const store = storeHelper(rest);
    const ret1 = store.dispatch(rest.actions.test()).then(
      () => Promise.reject("Abort shout generate error"),
      err => {
        try {
          expect("Application abort request").to.eql(err.message);
          expect({
            api: {
              empty: true,
              sync: false,
              syncing: false,
              loading: false,              
              request: {
                params: undefined,
                pathvars: undefined
              },
              error: err
            }
          }).to.eql(store.getState().test);
        } catch (err) {
          return Promise.reject(err);
        }
      }
    );
    const ret2 = store.dispatch(rest.actions.test.force());
    return Promise.all([ret1, ret2]).then(() => {
      expect(store.getState().test.data).to.eql("/api/url");
    });
  });
  */

  it("check pathvars", () => {
    const rest = reduxApi({
      test: "/api/url/:id"
    }).use("fetch", url => {
      return new Promise(resolve => resolve(url));
    });
    const store = storeHelper(rest);
    const INIT_STATE = {
      test: {
        api: {
          empty: true,
          request: null,
          sync: false,
          syncing: false,
          loading: false
        }
      }
    };
    expect(INIT_STATE).to.eql(store.getState());

    const STATE_1 = {
      test: {
        api: {
          empty: false,
          sync: true,
          syncing: false,
          loading: false,
          request: {
            pathvars: { id: 1 },
            params: { body: "Test", headers: ["JSON"] }
          },
          error: null
        },
        data: "/api/url/1"
      }
    };
    const STATE_2 = {
      test: {
        api: {
          empty: false,
          sync: true,
          syncing: false,
          loading: false,
          request: {
            pathvars: { id: 2 },
            params: { body: "Test2", headers: ["XML"] }
          },
          error: null
        },
        data: "/api/url/2"
      }
    };

    return store
      .dispatch(
        rest.actions.test({ id: 1 }, { body: "Test", headers: ["JSON"] })
      )
      .then(() => {
        expect(STATE_1).to.eql(store.getState());
        return store.dispatch(
          rest.actions.test({ id: 2 }, { body: "Test2", headers: ["XML"] })
        );
      })
      .then(() => {
        expect(STATE_2).to.eql(store.getState());
      });
  });
});
