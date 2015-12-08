"use strict";
/* global describe, it */

import { expect } from "chai";
import actionFn from "../src/actionFn";
import isFunction from "lodash/lang/isFunction";
import after from "lodash/function/after";

function fetchSuccess() {
  return new Promise(function(resolve) {
    resolve({ msg: "hello" });
  });
}

function getState() {
  return {
    test: { loading: false, syncing: false, sync: false, data: {} }
  };
}

function fetchFail() {
  return new Promise(function(resolve, reject) {
    reject("Error");
  });
}

const ACTIONS = {
  actionFetch: "actionFetch",
  actionSuccess: "actionSuccess",
  actionFail: "actionFail",
  actionReset: "actionReset"
};

describe("actionFn", function() {
  it("check null params", function() {
    const api = actionFn();
    expect(isFunction(api)).to.be.true;
  });

  it("check sync method", function() {
    let executeCounter = 0;
    const api = actionFn("/test", "test", null, ACTIONS, {
      holder: {
        fetch: ()=> {
          executeCounter++;
          return fetchSuccess();
        }
      }
    });

    const async1 = new Promise((resolve)=> {
      const initialState = getState();
      initialState.test.sync = true;

      api.sync(resolve)(function() {}, ()=> initialState);
      expect(executeCounter).to.be.eql(0);
    });

    const expectedEvent = [{
      type: ACTIONS.actionFetch,
      syncing: true
    }, {
      type: ACTIONS.actionSuccess,
      data: { msg: "hello" },
      syncing: false
    }];
    const async2 = new Promise((resolve)=> {
      api.sync(resolve)((msg)=> {
        expect(expectedEvent).to.have.length.above(0);
        const exp = expectedEvent.shift();
        expect(msg).to.eql(exp);
      }, getState);
    }).then(()=> {
      expect(executeCounter).to.be.eql(1);
      expect(expectedEvent).to.have.length(0);
    });

    return Promise.all([async1, async2]);
  });

  it("check request method", function() {
    let executeCounter = 0;
    let urlFetch, paramsFetch;
    const api = actionFn("/test/:id", "test", null, ACTIONS, {
      holder: {
        fetch: (url, params)=> {
          executeCounter++;
          urlFetch = url;
          paramsFetch = params;
          return fetchSuccess();
        }
      }
    });
    const async = api.request({ id: 2 }, { hello: "world" });
    expect(async).to.be.an.instanceof(Promise);
    return async.then((data)=> {
      expect(data).to.eql({ msg: "hello" });
      expect(urlFetch).to.eql("/test/2");
      expect(paramsFetch).to.eql({ hello: "world" });
    });
  });

  it("check normal usage", function() {
    const api = actionFn("/test", "test", null, ACTIONS, {
      holder: {
        fetch: fetchSuccess
      }
    });
    expect(api.reset()).to.eql({ type: ACTIONS.actionReset });
    const expectedEvent = [{
      type: ACTIONS.actionFetch,
      syncing: false
    }, {
      type: ACTIONS.actionSuccess,
      data: { msg: "hello" },
      syncing: false
    }];
    return new Promise((resolve)=> {
      const action = api(resolve);
      expect(isFunction(action)).to.be.true;
      function dispatch(msg) {
        expect(expectedEvent).to.have.length.above(0);
        const exp = expectedEvent.shift();
        expect(msg).to.eql(exp);
      }
      action(dispatch, getState);
    }).then(()=> {
      expect(expectedEvent).to.have.length(0);
    });
  });

  it("check fail fetch", function() {
    const api = actionFn("/test", "test", null, ACTIONS, {
      holder: {
        fetch: fetchFail
      }
    });
    const expectedEvent = [{
      type: ACTIONS.actionFetch,
      syncing: false
    }, {
      type: ACTIONS.actionFail,
      error: "Error",
      syncing: false
    }];
    function dispatch(msg) {
      expect(expectedEvent).to.have.length.above(0);
      const exp = expectedEvent.shift();
      expect(msg).to.eql(exp);
    }
    return new Promise((resolve)=> {
      api(resolve)(dispatch, getState);
    }).then(()=> {
      expect(expectedEvent).to.have.length(0);
    });
  });

  it("check double request", function(_done) {
    const api = actionFn("/test/:id", "test", null, ACTIONS, {
      holder: {
        fetch: fetchSuccess
      }
    });
    const expectedEvent = [{
      type: ACTIONS.actionFetch,
      syncing: false
    }, {
      type: ACTIONS.actionSuccess,
      data: { msg: "hello" },
      syncing: false
    }];
    let modify = 0;
    let loading = false;
    function dispatch(msg) {
      modify++;
      expect(expectedEvent).to.have.length.above(0);
      const exp = expectedEvent.shift();
      expect(msg).to.eql(exp);
    }
    function getState() {
      loading = !loading;
      return { test: { loading, data: {} } };
    }
    const done = after(2, _done);
    api({ id: 1 }, done)(dispatch, getState);
    expect(modify).to.eql(0);
    api({ id: 1 }, done)(dispatch, getState);
  });

  it("check options param", function() {
    let callOptions = 0;
    let checkOptions = null;
    const api = actionFn("/test/:id", "test", function(url, params, _getState) {
      expect(_getState).to.exist;
      expect(getState === _getState).to.be.true;
      callOptions++;
      return { ...params,  test: 1 };
    }, ACTIONS, {
      holder: {
        fetch: function(url, opts) {
          checkOptions = opts;
          return fetchSuccess();
        }
      }
    });
    function dispatch() {}
    return new Promise((resolve)=> {
      api("", { params: 1 }, resolve)(dispatch, getState);
      expect(callOptions).to.eql(1);
      expect(checkOptions).to.eql({ params: 1, test: 1 });
    });
  });

  it("check server mode", function() {
    function getServerState() {
      return {
        test: { loading: false, syncing: false, sync: true, data: {} }
      };
    }
    const api = actionFn("/test/:id", "test", null, ACTIONS, {
      holder: {
        fetch: fetchSuccess,
        server: true
      }
    });

    const expectedEvent = [
      { type: "actionFetch", syncing: true },
      { type: "actionSuccess", syncing: false, data: { msg: "hello" } }
    ];
    return new Promise((resolve)=> {
      api.sync(resolve)(function(msg) {
        expect(expectedEvent).to.have.length.above(0);
        const exp = expectedEvent.shift();
        expect(msg).to.eql(exp);
      }, getServerState);
    }).then(()=> {
      expect(expectedEvent).to.have.length(0);
    });
  });

  it("check broadcast option", function() {
    const BROADCAST_ACTION = "BROADCAST_ACTION";
    const expectedEvent = [{
      type: ACTIONS.actionFetch,
      syncing: false
    }, {
      type: ACTIONS.actionSuccess,
      data: { msg: "hello" },
      syncing: false
    }, {
      type: BROADCAST_ACTION,
      data: { msg: "hello" }
    }];
    const meta = {
      holder: { fetch: fetchSuccess },
      broadcast: [BROADCAST_ACTION]
    };
    const api = actionFn("/test/:id", "test", null, ACTIONS, meta);

    return new Promise((resolve)=> {
      api(resolve)(function(msg) {
        expect(expectedEvent).to.have.length.above(0);
        const exp = expectedEvent.shift();
        expect(msg).to.eql(exp);
      }, getState);
    }).then(()=> {
      expect(expectedEvent).to.have.length(0);
    });
  });
  it("check validation with request method", function() {
    let expData, counter = 0;
    const meta = {
      holder: { fetch: fetchSuccess },
      validation(data, cb) {
        counter++;
        expData = data;
        cb();
      }
    };
    const api = actionFn("/test/:id", "test", null, ACTIONS, meta);
    return api.request({ id: 1 }).then((data)=> {
      expect(data).to.eql({ msg: "hello" });
      expect(counter).to.eql(1);
      expect(expData).to.eql({ msg: "hello" });
    });
  });
  it("check success validation", function() {
    let expData, counter = 0;
    const meta = {
      holder: { fetch: fetchSuccess },
      validation(data, cb) {
        counter++;
        expData = data;
        cb();
      }
    };
    const expectedEvent = [{
      type: ACTIONS.actionFetch,
      syncing: false
    }, {
      type: ACTIONS.actionSuccess,
      data: { msg: "hello" },
      syncing: false
    }];

    const api = actionFn("/test/:id", "test", null, ACTIONS, meta);
    return new Promise((resolve)=> {
      api(resolve)(function(msg) {
        expect(expectedEvent).to.have.length.above(0);
        const exp = expectedEvent.shift();
        expect(msg).to.eql(exp);
      }, getState);
    }).then(()=> {
      expect(expectedEvent).to.have.length(0);
      expect(counter).to.eql(1);
      expect(expData).to.eql({ msg: "hello" });
    });
  });
  it("check unsuccess validation", function() {
    let expData, counter = 0;
    const meta = {
      holder: { fetch: fetchSuccess },
      validation(data, cb) {
        counter++;
        expData = data;
        cb("invalid");
      }
    };
    const expectedEvent = [{
      type: ACTIONS.actionFetch,
      syncing: false
    }, {
      type: ACTIONS.actionFail,
      error: "invalid",
      syncing: false
    }];
    const api = actionFn("/test/:id", "test", null, ACTIONS, meta);
    return new Promise((resolve)=> {
      api(resolve)(function(msg) {
        expect(expectedEvent).to.have.length.above(0);
        const exp = expectedEvent.shift();
        expect(msg).to.eql(exp);
      }, getState);
    }).then(()=> {
      expect(expectedEvent).to.have.length(0);
      expect(counter).to.eql(1);
      expect(expData).to.eql({ msg: "hello" });
    });
  });
  it("check prefetch option", function() {
    const checkPrefetch = [];
    const meta = {
      holder: { fetch: fetchSuccess },
      prefetch: [
        function(opts, cb) {
          checkPrefetch.push(["one", opts]);
          cb();
        },
        function(opts, cb) {
          checkPrefetch.push(["two", opts]);
          cb();
        },
      ]
    };
    const api = actionFn("/test/:id", "test", null, ACTIONS, meta);
    const expectedEvent = [{
      type: ACTIONS.actionFetch,
      syncing: false
    }, {
      type: ACTIONS.actionSuccess,
      data: { msg: "hello" },
      syncing: false
    }];
    function dispatch(msg) {
      expect(expectedEvent).to.have.length.above(0);
      const exp = expectedEvent.shift();
      expect(msg).to.eql(exp);
    }
    const expOpts = {
      dispatch, getState, actions: undefined, prefetch: meta.prefetch
    };
    return new Promise((resolve)=> {
      api(resolve)(dispatch, getState);
    }).then(()=> {
      expect(expectedEvent).to.have.length(0);
      expect(checkPrefetch).to.eql([
        ["one", expOpts],
        ["two", expOpts],
      ]);
    });
  });
  it("check incorrect helpers name", function() {
    expect(
      ()=> actionFn("/test/:id", "test", null, ACTIONS, {
        helpers: {
          reset() {}
        }
      })
    ).to.throw(Error, `Helper name: "reset" for endpoint "test" has been already reserved`);
    expect(
      ()=> actionFn("/test/:id", "test", null, ACTIONS, {
        helpers: {
          sync() {}
        }
      })
    ).to.throw(Error, `Helper name: "sync" for endpoint "test" has been already reserved`);
  });
  it("check helpers with async functionality", function() {
    const meta = {
      holder: {
        fetch(url, opts) {
          return new Promise((resolve)=> resolve({ url, opts }));
        }
      },
      helpers: {
        asyncSuccess: ()=> (cb)=> cb(null, [{ id: 1 }, { async: true }]),
        asyncFail: ()=> (cb)=> cb("Error")
      }
    };
    const api = actionFn("/test/:id", "test", null, ACTIONS, meta);
    const expectedEvent1 = [{
      type: ACTIONS.actionFetch,
      syncing: false
    }, {
      type: ACTIONS.actionSuccess,
      syncing: false,
      data: { url: "/test/1", opts: { async: true } }
    }];
    const wait1 = new Promise((resolve)=> {
      api.asyncSuccess(resolve)(function(msg) {
        expect(expectedEvent1).to.have.length.above(0);
        const exp = expectedEvent1.shift();
        expect(msg).to.eql(exp);
      }, getState);
    });
    let errorMsg;
    const wait2 = new Promise((resolve)=> {
      api.asyncFail(function(err) {
        errorMsg = err;
        resolve();
      })(function() {}, getState);
    });
    return Promise.all([wait1, wait2])
      .then(()=> {
        expect(expectedEvent1).to.have.length(0);
        expect(errorMsg).to.eql("Error");
      });
  });
  it("check merge params", function() {
    let params;
    const meta = {
      holder: {
        fetch: (urlparams, _params)=> {
          params = _params;
          return fetchSuccess();
        }
      }
    };
    const opts = { headers: { "One": 1 } };
    const api = actionFn("/test", "test", opts, ACTIONS, meta);
    return api.request(null, { headers: { "Two": 2 } }).then(()=> {
      console.log(params);
      expect(params).to.eql({
        headers: {
          "One": 1,
          "Two": 2
        }
      });
    });
  });
});
