"use strict";
/* global describe, it, xit */

import { expect } from "chai";
import reduxApi from "../src/index.js";
import transformers from "../src/transformers.js";
import isFunction from "lodash/isFunction";
import size from "lodash/size";

function getState() {
  return { test: { loading: false, data: {} } };
}

describe("index", function() {
  it("check transformers", function() {
    expect(transformers.array()).to.eql([]);
    expect(transformers.array({ id: 1 })).to.eql([{ id: 1 }]);
    expect(transformers.array([1])).to.eql([1]);

    expect(transformers.object()).to.eql({});
    expect(transformers.object({ id: 1 })).to.eql({ id: 1 });
    expect(transformers.object([1])).to.eql({ data: [1] });
    expect(transformers.object("test")).to.eql({ data: "test" });
    expect(transformers.object(1)).to.eql({ data: 1 });
    expect(transformers.object(true)).to.eql({ data: true });
  });
  it("check null params", function() {
    expect(isFunction(reduxApi)).to.be.true;
    const api = reduxApi();
    expect(api.actions).to.eql({});
    expect(api.reducers).to.eql({});
  });
  it("check rootUrl", function() {
    const urls = [];
    function fetchUrl(url) {
      urls.push(url);
      return new Promise((resolve)=> resolve({ msg: "hello" }));
    }
    const res = reduxApi({
      test1: "/url1/",
      test2: "url2",
      test3: "",
      test4: "/(:id)"
    })
    .use("fetch", fetchUrl)
    .use("server", false)
    .use("rootUrl", "http://api.com/root");

    const res2 = reduxApi({
      test1: "/url1/",
      test2: "url2",
      test3: "",
      test4: "/(:id)"
    })
    .use("fetch", fetchUrl)
    .use("server", false)
    .use("rootUrl", "http://api.ru/");

    const act = res.actions;
    const act2 = res2.actions;
    return Promise.all([
      act.test1.request(),
      act.test2.request(),
      act.test3.request(),
      act.test4.request({ id: 1 }),
      act2.test1.request(),
      act2.test2.request(),
      act2.test3.request(),
      act2.test4.request({ id: 2 })
    ]).then(()=> {
      expect([
        "http://api.com/root/url1/",
        "http://api.com/root/url2",
        "http://api.com/root/",
        "http://api.com/root/1",
        "http://api.ru/url1/",
        "http://api.ru/url2",
        "http://api.ru/",
        "http://api.ru/2"
      ]).to.eql(urls);
    });
  });
  it("check string url", function() {
    function fetchSuccess(url, data) {
      expect(url).to.eql("/plain/url");
      expect(data).to.eql({});
      return new Promise(function(resolve) {
        resolve({ msg: "hello" });
      });
    }
    const res = reduxApi({
      test: "/plain/url"
    })
    .use("fetch", fetchSuccess);
    expect(size(res.actions)).to.eql(1);
    expect(size(res.events)).to.eql(1);

    expect(size(res.reducers)).to.eql(1);
    expect(res.actions.test).to.exist;
    expect(res.events.test).to.have.keys(
      "actionFetch",
      "actionSuccess",
      "actionFail",
      "actionReset"
    );
    expect(res.reducers.test).to.exist;
    const expectedEvent = [
      {
        type: "@@redux-api@test",
        syncing: false,
        request: { pathvars: undefined, params: {} }
      }, {
        type: "@@redux-api@test_success",
        data: { msg: "hello" },
        syncing: false,
        request: { pathvars: undefined, params: {} }
      }
    ];
    return new Promise((resolve)=> {
      const action = res.actions.test(resolve);
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
  it("check object url", function() {
    function fetchSuccess(url, options) {
      expect(url).to.eql("/plain/url/1");
      expect(options).to.eql({
        headers: {
          Accept: "application/json"
        }
      });
      return new Promise(function(resolve) {
        resolve({ msg: "hello" });
      });
    }
    const res = reduxApi({
      test: {
        url: "/plain/url/:id",
        options: {
          headers: {
            Accept: "application/json"
          }
        }
      }
    }).use("fetch", fetchSuccess);
    expect(res.actions.test).to.exist;
    expect(res.reducers.test).to.exist;

    const expectedEvent = [{
      type: "@@redux-api@test",
      syncing: false,
      request: { pathvars: { id: 1 }, params: {} }
    }, {
      type: "@@redux-api@test_success",
      data: { msg: "hello" },
      syncing: false,
      request: { pathvars: { id: 1 }, params: {} }
    }];
    return new Promise((resolve)=> {
      const action = res.actions.test({ id: 1 }, resolve);
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
  it("use provided reducerName when avaliable", function() {
    const res = reduxApi({
      test: {
        reducerName: "foo",
        url: "/plain/url/:id",
        options: {
          headers: {
            Accept: "application/json"
          }
        }
      }
    }).use("fetch", function fetchSuccess() {});
    expect(res.actions.test).to.exist;
    expect(res.reducers.test).to.not.exist;
    expect(res.reducers.foo).to.exist;
  });

  xit("check virtual option with broadcast", function() {
    const BROADCAST_ACTION = "BROADCAST_ACTION";
    const res = reduxApi({
      test: {
        url: "/api",
        broadcast: [BROADCAST_ACTION],
        virtual: true
      }
    }).use("fetch", function fetchSuccess() {});
    expect(res.actions.test).to.exist;
    expect(res.reducers.test).to.not.exist;
  });

  it("check prefetch options", function() {
    const expectUrls = [];
    function fetchSuccess(url) {
      expectUrls.push(url);
      return new Promise((resolve)=> resolve({ url }));
    }
    const res = reduxApi({
      test: "/test",
      test1: {
        url: "/test1",
        prefetch: [
          function(opts, cb) {
            opts.actions.test(cb)(
              opts.dispatch, opts.getState
            );
          }
        ]
      }
    }).use("fetch", fetchSuccess);
    return new Promise((resolve)=> {
      const action = res.actions.test1(resolve);
      action(function() {}, getState);
    }).then(()=> {
      expect(expectUrls).to.eql([
        "/test", "/test1"
      ]);
    });
  });

  it("check helpers", function() {
    const result = [];
    function getState() {
      return {
        params: { id: 9, name: "kitty" },
        hello: { loading: false, data: {} }
      };
    }
    function dispatch() {}
    const res = reduxApi({
      hello: {
        url: "/test/:name/:id",
        helpers: {
          test1(id, name) {
            return [{ id, name }];
          },
          test2() {
            const { id, name } = this.getState().params;
            return [{ id, name }];
          },
          testSync: {
            sync: true,
            call(id) {
              return [{ id, name: "admin" }, { method: "post" }];
            }
          }
        }
      }
    }).use("fetch", function(url, opts) {
      result.push({ url, opts });
      return new Promise(
        (resolve)=> resolve({ hello: "world" }));
    });
    const a1 = new Promise((resolve)=> {
      res.actions.hello.test1(2, "lexich", resolve)(dispatch, getState);
    });
    const a2 = new Promise((resolve)=> {
      res.actions.hello.test2(resolve)(dispatch, getState);
    });
    const a3 = new Promise((resolve)=> {
      const mockSync = res.actions.hello.sync;
      let counter = 0;
      res.actions.hello.sync = function(...args) {
        counter++;
        return mockSync.apply(this, args);
      };
      res.actions.hello.testSync(1, resolve)(dispatch, getState);
      expect(counter).to.eql(1);
    });
    return Promise.all([a1, a2, a3]).then(()=> {
      expect(result).to.eql([
        { url: "/test/lexich/2", opts: {} },
        { url: "/test/kitty/9", opts: {} },
        { url: "/test/admin/1", opts: { method: "post" } }
      ]);
    });
  });
  it("check global options", ()=> {
    let expOpts;
    const rest = reduxApi({
      test: {
        options: {
          headers: {
            "X-Header": 1
          }
        },
        url: "/api/test"
      }
    })
    .use("options", {
      headers: {
        Accept: "application/json"
      }
    })
    .use("fetch", (url, options)=> {
      expOpts=options;
    });
    rest.actions.test.request();
    expect(expOpts).to.eql({
      headers: {
        Accept: "application/json",
        "X-Header": 1
      }
    });
  });
  it("check global options as function", ()=> {
    let expOpts;
    const rest = reduxApi({
      test: {
        options: {
          headers: {
            "X-Header": 1
          }
        },
        url: "/api/test/(:id)"
      }
    })
    .use("options", (url, params /* , getState */)=> {
      expect(url).to.eql("/api/test/1");
      expect(params).to.eql({ a: "b" });
      return {
        headers: {
          Accept: "application/json"
        }
      };
    })
    .use("fetch", (url, options)=> {
      expOpts=options;
    });
    rest.actions.test.request({ id: 1 }, { a: "b" });
    expect(expOpts).to.eql({
      a: "b",
      headers: {
        Accept: "application/json",
        "X-Header": 1
      }
    });
  });

  it("check crud option", ()=> {
    const rest = reduxApi({
      test: { url: "/test", crud: true }
    });
    expect(rest.actions.test).to.include.keys(
      "get", "post", "delete", "put", "patch"
    );
    expect(rest.actions.test).to.include.keys(
      "request", "reset", "sync"
    );
  });
});
