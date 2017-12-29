"use strict";

/* global describe, it */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}], no-void: 0 */
import { expect } from "chai";
import isFunction from "lodash/isFunction";
import actionFn from "../src/actionFn";

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

const ERROR = new Error("Error");

function fetchFail() {
  return new Promise(function(resolve, reject) {
    reject(ERROR);
  });
}

function transformer(data) {
  return data;
}

const ACTIONS = {
  actionFetch: "actionFetch",
  actionSuccess: "actionSuccess",
  actionFail: "actionFail",
  actionReset: "actionReset",
  actionCache: "actionCache"
};

describe("actionFn", function() {
  it("check null params", function() {
    const api = actionFn();
    expect(isFunction(api)).to.be.true;
  });

  it("check sync method", function() {
    let executeCounter = 0;
    const api = actionFn("/test", "test", null, ACTIONS, {
      transformer,
      fetch: () => {
        executeCounter += 1;
        return fetchSuccess();
      }
    });

    const async1 = new Promise(resolve => {
      const initialState = getState();
      initialState.test.sync = true;

      api.sync(resolve)(function() {}, () => initialState);
      expect(executeCounter).to.be.eql(0);
    });

    const expectedEvent = [
      {
        type: ACTIONS.actionFetch,
        syncing: true,
        request: { pathvars: undefined, params: {} }
      },
      {
        type: ACTIONS.actionSuccess,
        data: { msg: "hello" },
        origData: { msg: "hello" },
        syncing: false,
        request: { pathvars: undefined, params: {} }
      }
    ];
    const async2 = new Promise(resolve => {
      api.sync(resolve)(msg => {
        expect(expectedEvent).to.have.length.above(0);
        const exp = expectedEvent.shift();
        expect(msg).to.eql(exp);
      }, getState);
    }).then(() => {
      expect(executeCounter).to.be.eql(1);
      expect(expectedEvent).to.have.length(0);
    });

    return Promise.all([async1, async2]);
  });

  it("check request method", function() {
    let urlFetch;
    let paramsFetch;
    const api = actionFn("/test/:id", "test", null, ACTIONS, {
      transformer,
      fetch: (url, params) => {
        urlFetch = url;
        paramsFetch = params;
        return fetchSuccess();
      }
    });
    const async = api.request({ id: 2 }, { hello: "world" });
    expect(async).to.be.an.instanceof(Promise);
    return async.then(data => {
      expect(data).to.eql({ msg: "hello" });
      expect(urlFetch).to.eql("/test/2");
      expect(paramsFetch).to.eql({ hello: "world" });
    });
  });

  it("check normal usage", function() {
    const api = actionFn("/test", "test", null, ACTIONS, {
      transformer,
      fetch: fetchSuccess
    });
    expect(api.reset()).to.eql({ type: ACTIONS.actionReset });
    const expectedEvent = [
      {
        type: ACTIONS.actionFetch,
        syncing: false,
        request: { pathvars: undefined, params: {} }
      },
      {
        type: ACTIONS.actionSuccess,
        data: { msg: "hello" },
        origData: { msg: "hello" },
        syncing: false,
        request: { pathvars: undefined, params: {} }
      }
    ];
    return new Promise(resolve => {
      const action = api(resolve);
      expect(isFunction(action)).to.be.true;
      function dispatch(msg) {
        expect(expectedEvent).to.have.length.above(0);
        const exp = expectedEvent.shift();
        expect(msg).to.eql(exp);
      }
      action(dispatch, getState);
    }).then(() => {
      expect(expectedEvent).to.have.length(0);
    });
  });

  it("check reset helper with mutation", function() {
    const api = actionFn("/test", "test", null, ACTIONS, {
      transformer,
      fetch: fetchSuccess
    });
    expect(api.reset()).to.eql({ type: ACTIONS.actionReset });
    expect(api.reset("sync")).to.eql({
      type: ACTIONS.actionReset,
      mutation: "sync"
    });
    expect(api.reset("other")).to.eql({ type: ACTIONS.actionReset });
  });

  it("check fail fetch", function() {
    const api = actionFn("/test", "test", null, ACTIONS, {
      transformer,
      fetch: fetchFail
    });
    const expectedEvent = [
      {
        type: ACTIONS.actionFetch,
        syncing: false,
        request: { pathvars: undefined, params: {} }
      },
      {
        type: ACTIONS.actionFail,
        error: ERROR,
        syncing: false,
        request: { pathvars: undefined, params: {} }
      }
    ];
    function dispatch(msg) {
      expect(expectedEvent).to.have.length.above(0);
      const exp = expectedEvent.shift();
      expect(msg.type).to.eql(exp.type);
      expect(msg.syncing).to.eql(exp.syncing);
      expect(msg.request).to.eql(exp.request);
      expect(msg.error).to.eql(exp.error);
    }
    return new Promise(resolve => {
      api(resolve)(dispatch, getState);
    }).then(
      () => {
        expect(expectedEvent).to.have.length(0);
      },
      err => expect(null).to.eql(err)
    );
  });

  it("check options param", function() {
    let callOptions = 0;
    let checkOptions = null;
    const api = actionFn(
      "/test/:id",
      "test",
      function(url, params, _getState) {
        expect(_getState).to.exist;
        expect(getState === _getState).to.be.true;
        callOptions += 1;
        return { ...params, test: 1 };
      },
      ACTIONS,
      {
        transformer,
        fetch(url, opts) {
          checkOptions = opts;
          return fetchSuccess();
        }
      }
    );
    function dispatch() {}
    return new Promise(resolve => {
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
      transformer,
      fetch: fetchSuccess,
      holder: {
        server: true
      }
    });

    const expectedEvent = [
      {
        type: ACTIONS.actionFetch,
        syncing: true,
        request: { pathvars: undefined, params: {} }
      },
      {
        type: ACTIONS.actionSuccess,
        syncing: false,
        data: { msg: "hello" },
        origData: { msg: "hello" },
        request: { pathvars: undefined, params: {} }
      }
    ];
    return new Promise(resolve => {
      api.sync(resolve)(function(msg) {
        expect(expectedEvent).to.have.length.above(0);
        const exp = expectedEvent.shift();
        expect(msg).to.eql(exp);
      }, getServerState);
    }).then(() => {
      expect(expectedEvent).to.have.length(0);
    });
  });

  it("check broadcast option", function() {
    const BROADCAST_ACTION = "BROADCAST_ACTION";
    const expectedEvent = [
      {
        type: ACTIONS.actionFetch,
        syncing: false,
        request: { pathvars: undefined, params: {} }
      },
      {
        type: ACTIONS.actionSuccess,
        data: { msg: "hello" },
        origData: { msg: "hello" },
        syncing: false,
        request: { pathvars: undefined, params: {} }
      },
      {
        type: BROADCAST_ACTION,
        data: { msg: "hello" },
        origData: { msg: "hello" },
        request: { pathvars: undefined, params: {} }
      }
    ];
    const meta = {
      transformer,
      fetch: fetchSuccess,
      broadcast: [BROADCAST_ACTION]
    };
    const api = actionFn("/test/:id", "test", null, ACTIONS, meta);

    return new Promise(resolve => {
      api(resolve)(function(msg) {
        expect(expectedEvent).to.have.length.above(0);
        const exp = expectedEvent.shift();
        expect(msg).to.eql(exp);
      }, getState);
    }).then(() => {
      expect(expectedEvent).to.have.length(0);
    });
  });
  it("check validation with request method", function() {
    let expData;
    let counter = 0;
    const meta = {
      transformer,
      fetch: fetchSuccess,
      validation(data, cb) {
        counter += 1;
        expData = data;
        cb();
      }
    };
    const api = actionFn("/test/:id", "test", null, ACTIONS, meta);
    return api.request({ id: 1 }).then(data => {
      expect(data).to.eql({ msg: "hello" });
      expect(counter).to.eql(1);
      expect(expData).to.eql({ msg: "hello" });
    });
  });
  it("check success validation", function() {
    let expData;
    let counter = 0;
    const meta = {
      transformer,
      fetch: fetchSuccess,
      validation(data, cb) {
        counter += 1;
        expData = data;
        cb();
      }
    };
    const expectedEvent = [
      {
        type: ACTIONS.actionFetch,
        syncing: false,
        request: { pathvars: undefined, params: {} }
      },
      {
        type: ACTIONS.actionSuccess,
        data: { msg: "hello" },
        origData: { msg: "hello" },
        syncing: false,
        request: { pathvars: undefined, params: {} }
      }
    ];

    const api = actionFn("/test/:id", "test", null, ACTIONS, meta);
    return new Promise(resolve => {
      api(resolve)(function(msg) {
        expect(expectedEvent).to.have.length.above(0);
        const exp = expectedEvent.shift();
        expect(msg).to.eql(exp);
      }, getState);
    }).then(() => {
      expect(expectedEvent).to.have.length(0);
      expect(counter).to.eql(1);
      expect(expData).to.eql({ msg: "hello" });
    });
  });
  it("check unsuccess validation", function() {
    let expData;
    let counter = 0;
    const meta = {
      transformer,
      fetch: fetchSuccess,
      validation(data, cb) {
        counter += 1;
        expData = data;
        cb("invalid");
      }
    };
    const expectedEvent = [
      {
        type: ACTIONS.actionFetch,
        syncing: false,
        request: { pathvars: undefined, params: {} }
      },
      {
        type: ACTIONS.actionFail,
        error: "invalid",
        syncing: false,
        request: { pathvars: undefined, params: {} }
      }
    ];
    const api = actionFn("/test/:id", "test", null, ACTIONS, meta);
    return new Promise(resolve => {
      api(resolve)(function(msg) {
        expect(expectedEvent).to.have.length.above(0);
        const exp = expectedEvent.shift();
        expect(msg.type).to.eql(exp.type);
        expect(msg.syncing).to.eql(exp.syncing);
        expect(msg.request).to.eql(exp.request);
        expect(msg.error).to.eql(exp.error);
      }, getState);
    }).then(
      () => {
        expect(expectedEvent).to.have.length(0);
        expect(counter).to.eql(1);
        expect(expData).to.eql({ msg: "hello" });
      },
      err => expect(null).to.eql(err)
    );
  });
  it("check postfetch option", function() {
    let expectedOpts;
    const meta = {
      transformer,
      fetch: fetchSuccess,
      postfetch: [
        function(opts) {
          expectedOpts = opts;
          opts.dispatch({ type: "One", data: opts.data });
        },
        function(opts) {
          opts.dispatch({ type: "Two", data: opts.data });
        }
      ],
      actions: { hello: "a" }
    };
    const api = actionFn("/test/:id", "test", null, ACTIONS, meta);
    const expectedEvent = [
      {
        type: ACTIONS.actionFetch,
        syncing: false,
        request: { pathvars: undefined, params: {} }
      },
      {
        type: ACTIONS.actionSuccess,
        data: { msg: "hello" },
        origData: { msg: "hello" },
        syncing: false,
        request: { pathvars: undefined, params: {} }
      },
      {
        type: "One",
        data: { msg: "hello" }
      },
      {
        type: "Two",
        data: { msg: "hello" }
      }
    ];
    function dispatch(msg) {
      expect(expectedEvent).to.have.length.above(0);
      const exp = expectedEvent.shift();
      expect(msg).to.eql(exp);
    }
    return new Promise(resolve => {
      api(resolve)(dispatch, getState);
    }).then(() => {
      expect(expectedOpts).to.exist;
      expect(expectedOpts).to.include.keys(
        "data",
        "getState",
        "dispatch",
        "actions",
        "request"
      );
      expect(expectedOpts.getState).to.eql(getState);
      expect(expectedOpts.dispatch).to.eql(dispatch);
      expect(expectedOpts.actions).to.eql({ hello: "a" });
      expect(expectedOpts.request).to.eql({ params: {}, pathvars: void 0 });
    });
  });
  it("check prefetch option", function() {
    const checkPrefetch = [];
    const meta = {
      transformer,
      fetch: fetchSuccess,
      prefetch: [
        function(opts, cb) {
          checkPrefetch.push(["one", opts]);
          cb();
        },
        function(opts, cb) {
          checkPrefetch.push(["two", opts]);
          cb();
        }
      ]
    };
    const requestOptions = { pathvars: undefined, params: {} };
    const api = actionFn("/test/:id", "test", null, ACTIONS, meta);
    const expectedEvent = [
      {
        type: ACTIONS.actionFetch,
        syncing: false,
        request: requestOptions
      },
      {
        type: ACTIONS.actionSuccess,
        data: { msg: "hello" },
        origData: { msg: "hello" },
        syncing: false,
        request: requestOptions
      }
    ];
    function dispatch(msg) {
      expect(expectedEvent).to.have.length.above(0);
      const exp = expectedEvent.shift();
      expect(msg).to.eql(exp);
    }
    const expOpts = {
      dispatch,
      getState,
      request: requestOptions,
      actions: undefined,
      prefetch: meta.prefetch
    };
    return new Promise(resolve => {
      api(resolve)(dispatch, getState);
    }).then(
      () => {
        expect(expectedEvent).to.have.length(0);
        expect(checkPrefetch).to.eql([["one", expOpts], ["two", expOpts]]);
      },
      err => expect(null).to.eql(err)
    );
  });
  it("check incorrect helpers name", function() {
    expect(() =>
      actionFn("/test/:id", "test", null, ACTIONS, {
        helpers: {
          reset() {}
        }
      })
    ).to.throw(
      Error,
      'Helper name: "reset" for endpoint "test" has been already reserved'
    );
    expect(() =>
      actionFn("/test/:id", "test", null, ACTIONS, {
        helpers: {
          sync() {}
        }
      })
    ).to.throw(
      Error,
      'Helper name: "sync" for endpoint "test" has been already reserved'
    );
  });
  it("check that helpers returns Promise", function() {
    const api = actionFn("/test/:id", "test", null, ACTIONS, {
      transformer,
      fetch: fetchSuccess,
      helpers: {
        test: () => cb => cb(null, [{ id: 1 }, { async: true }])
      }
    });
    const result = api.test()(() => {}, getState);
    expect(result).to.be.an.instanceof(Promise);
  });
  it("check helpers with async functionality", function() {
    const meta = {
      transformer,
      fetch(url, opts) {
        return new Promise(resolve => resolve({ url, opts }));
      },
      helpers: {
        asyncSuccess: () => cb => cb(null, [{ id: 1 }, { async: true }]),
        asyncFail: () => cb => cb("Error")
      }
    };
    const api = actionFn("/test/:id", "test", null, ACTIONS, meta);
    const expectedEvent1 = [
      {
        type: ACTIONS.actionFetch,
        syncing: false,
        request: { pathvars: { id: 1 }, params: { async: true } }
      },
      {
        type: ACTIONS.actionSuccess,
        syncing: false,
        data: { url: "/test/1", opts: { async: true } },
        origData: { url: "/test/1", opts: { async: true } },
        request: { pathvars: { id: 1 }, params: { async: true } }
      }
    ];
    const wait1 = new Promise(resolve => {
      api.asyncSuccess(resolve)(function(msg) {
        expect(expectedEvent1).to.have.length.above(0);
        const exp = expectedEvent1.shift();
        expect(msg).to.eql(exp);
      }, getState);
    });
    let errorMsg;
    const wait2 = new Promise(resolve => {
      api.asyncFail(function(err) {
        errorMsg = err;
        resolve();
      })(function() {}, getState);
    });
    return Promise.all([wait1, wait2]).then(() => {
      expect(expectedEvent1).to.have.length(0);
      expect(errorMsg).to.eql("Error");
    });
  });

  it("check crud option", function() {
    const meta = {
      transformer,
      crud: true,
      fetch(url, opts) {
        return new Promise(resolve => resolve({ url, opts }));
      }
    };
    const api = actionFn("/test/:id", "test", null, ACTIONS, meta);
    const expectedEvent = [
      {
        type: ACTIONS.actionFetch,
        syncing: false,
        request: {
          pathvars: { id: 1 },
          params: { method: "GET" }
        }
      },
      {
        type: ACTIONS.actionFetch,
        syncing: false,
        request: {
          pathvars: { id: 2 },
          params: { body: "Hello", method: "POST" }
        }
      },
      {
        type: ACTIONS.actionFetch,
        syncing: false,
        request: {
          pathvars: { id: 3 },
          params: { body: "World", method: "PUT" }
        }
      },
      {
        type: ACTIONS.actionFetch,
        syncing: false,
        request: {
          pathvars: { id: 4 },
          params: { method: "DELETE" }
        }
      },
      {
        type: ACTIONS.actionFetch,
        syncing: false,
        request: {
          pathvars: { id: 5 },
          params: { body: "World", method: "PATCH" }
        }
      },
      {
        type: ACTIONS.actionSuccess,
        syncing: false,
        data: { url: "/test/1", opts: { method: "GET" } },
        origData: { url: "/test/1", opts: { method: "GET" } },
        request: {
          pathvars: { id: 1 },
          params: { method: "GET" }
        }
      },
      {
        type: ACTIONS.actionSuccess,
        syncing: false,
        data: {
          url: "/test/2",
          opts: { body: "Hello", method: "POST" }
        },
        origData: {
          url: "/test/2",
          opts: { body: "Hello", method: "POST" }
        },
        request: {
          pathvars: { id: 2 },
          params: { body: "Hello", method: "POST" }
        }
      },
      {
        type: ACTIONS.actionSuccess,
        syncing: false,
        data: {
          url: "/test/3",
          opts: { body: "World", method: "PUT" }
        },
        origData: {
          url: "/test/3",
          opts: { body: "World", method: "PUT" }
        },
        request: {
          pathvars: { id: 3 },
          params: { body: "World", method: "PUT" }
        }
      },
      {
        type: ACTIONS.actionSuccess,
        syncing: false,
        data: {
          url: "/test/4",
          opts: { method: "DELETE" }
        },
        origData: {
          url: "/test/4",
          opts: { method: "DELETE" }
        },
        request: {
          pathvars: { id: 4 },
          params: { method: "DELETE" }
        }
      },
      {
        type: ACTIONS.actionSuccess,
        syncing: false,
        data: {
          url: "/test/5",
          opts: { body: "World", method: "PATCH" }
        },
        origData: {
          url: "/test/5",
          opts: { body: "World", method: "PATCH" }
        },
        request: {
          pathvars: { id: 5 },
          params: { body: "World", method: "PATCH" }
        }
      }
    ];

    const getQuery = new Promise(resolve => {
      api.get({ id: 1 }, resolve)(function(msg) {
        expect(expectedEvent).to.have.length.above(0);
        const exp = expectedEvent.shift();
        expect(msg).to.eql(exp);
      }, getState);
    });

    const postQuery = new Promise(resolve => {
      api.post({ id: 2 }, { body: "Hello" }, resolve)(function(msg) {
        expect(expectedEvent).to.have.length.above(0);
        const exp = expectedEvent.shift();
        expect(msg).to.eql(exp);
      }, getState);
    });
    const putQuery = new Promise(resolve => {
      api.put({ id: 3 }, { body: "World" }, resolve)(function(msg) {
        expect(expectedEvent).to.have.length.above(0);
        const exp = expectedEvent.shift();
        expect(msg).to.eql(exp);
      }, getState);
    });
    const deleteQuery = new Promise(resolve => {
      api.delete({ id: 4 }, resolve)(function(msg) {
        expect(expectedEvent).to.have.length.above(0);
        const exp = expectedEvent.shift();
        expect(msg).to.eql(exp);
      }, getState);
    });
    const patchQuery = new Promise(resolve => {
      api.patch({ id: 5 }, { body: "World" }, resolve)(function(msg) {
        expect(expectedEvent).to.have.length.above(0);
        const exp = expectedEvent.shift();
        expect(msg).to.eql(exp);
      }, getState);
    });

    return Promise.all([
      getQuery,
      postQuery,
      putQuery,
      deleteQuery,
      patchQuery
    ]).then(() => expect(expectedEvent).to.have.length(0));
  });

  it("check crud option with overwrite", function() {
    const meta = {
      transformer,
      crud: true,
      fetch(url, opts) {
        return new Promise(resolve => resolve({ url, opts }));
      },
      helpers: {
        get() {
          return [{ id: "overwrite" }];
        }
      }
    };
    const api = actionFn("/test/:id", "test", null, ACTIONS, meta);
    const expectedEvent = [
      {
        type: ACTIONS.actionFetch,
        syncing: false,
        request: { pathvars: { id: "overwrite" }, params: undefined }
      },
      {
        type: ACTIONS.actionSuccess,
        syncing: false,
        data: { url: "/test/overwrite", opts: null },
        origData: { url: "/test/overwrite", opts: null },
        request: { pathvars: { id: "overwrite" }, params: undefined }
      }
    ];

    return new Promise(resolve => {
      api.get({ id: 1 }, resolve)(function(msg) {
        expect(expectedEvent).to.have.length.above(0);
        const exp = expectedEvent.shift();
        expect(msg).to.eql(exp);
      }, getState);
    }).then(() => expect(expectedEvent).to.have.length(0));
  });

  it("check crud option with overwrite 2", function() {
    const meta = {
      transformer,
      crud: true,
      fetch(url, opts) {
        return new Promise(resolve => resolve({ url, opts }));
      },
      helpers: {
        get(param) {
          return [{ id: param.id }, null];
        }
      }
    };
    const api = actionFn("/test/", "test", null, ACTIONS, meta);
    const expectedEvent = [
      {
        type: ACTIONS.actionFetch,
        syncing: false,
        request: {
          pathvars: { id: 1 },
          params: null
        }
      },
      {
        type: ACTIONS.actionSuccess,
        syncing: false,
        data: { url: "/test/?id=1", opts: null },
        origData: { url: "/test/?id=1", opts: null },
        request: { pathvars: { id: 1 }, params: null }
      }
    ];

    return new Promise(resolve => {
      api.get({ id: 1 }, resolve)(function(msg) {
        expect(expectedEvent).to.have.length.above(0);
        const exp = expectedEvent.shift();
        expect(msg).to.eql(exp);
      }, getState);
    }).then(() => expect(expectedEvent).to.have.length(0));
  });

  it("check merge params", function() {
    let params;
    const meta = {
      transformer,
      fetch: (urlparams, _params) => {
        params = _params;
        return fetchSuccess();
      }
    };
    const opts = { headers: { One: 1 } };
    const api = actionFn("/test", "test", opts, ACTIONS, meta);
    return api.request(null, { headers: { Two: 2 } }).then(() => {
      expect(params).to.eql({
        headers: {
          One: 1,
          Two: 2
        }
      });
    });
  });

  it("check urlOptions", function() {
    let urlFetch;
    const api = actionFn("/test", "test", null, ACTIONS, {
      transformer,
      fetch: url => {
        urlFetch = url;
        return fetchSuccess();
      },
      urlOptions: {
        delimiter: ",",
        arrayFormat: "repeat"
      }
    });
    const async = api.request({ id: [1, 2] });
    expect(async).to.be.an.instanceof(Promise);
    return async.then(() => {
      expect(urlFetch).to.eql("/test?id=1,id=2");
    });
  });

  it("check responseHandler success", function() {
    const resp = [];
    const api = actionFn("/test", "test", null, ACTIONS, {
      transformer,
      fetch() {
        return fetchSuccess();
      },
      holder: {
        responseHandler(err, data) {
          resp.push({ err, data });
        }
      }
    });
    return api.request().then(() => {
      expect(resp).to.eql([{ err: null, data: { msg: "hello" } }]);
    });
  });

  it("check responseHandler error", function() {
    const resp = [];
    const api = actionFn("/test", "test", null, ACTIONS, {
      transformer,
      fetch() {
        return fetchFail();
      },
      holder: {
        responseHandler(err, data) {
          resp.push({ err, data });
        }
      }
    });
    return api.request().then(null, () => {
      expect(resp).to.have.length(1);
      expect(resp[0].data).to.not.exist;
      expect(resp[0].err).to.be.an.instanceof(Error);
    });
  });

  it("chained callbacks all resolve", function() {
    const meta = {
      transformer,
      crud: true,
      fetch(url, opts) {
        return new Promise(resolve => resolve({ url, opts }));
      }
    };
    const api = actionFn("/test/:id", "test", null, ACTIONS, meta);

    let callCount = 0;

    function spy(resolve) {
      callCount += 1;
      resolve();
    }
    function none() {}

    function chainedAction(resolve) {
      api.get({ id: 1 }, () => spy(resolve))(none, getState);
    }

    return new Promise(resolve =>
      api.get({ id: 1 }, () => chainedAction(resolve))(none, getState)
    ).then(() => expect(callCount).to.have.length.equal(1));
  });
});
