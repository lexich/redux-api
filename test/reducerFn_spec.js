"use strict";

/* global describe, it */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
import { expect } from "chai";
import isFunction from "lodash/isFunction";
import reducerFn from "../src/reducerFn";

describe("reducerFn", function() {
  it("check null params", function() {
    expect(isFunction(reducerFn)).to.be.true;
    const fn = reducerFn();
    expect(isFunction(fn)).to.be.true;
  });
  it("check", function() {
    const initialState = { msg: "Hello" };
    const actions = {
      actionFetch: "actionFetch",
      actionSuccess: "actionSuccess",
      actionFail: "actionFail",
      actionReset: "actionReset"
    };
    const fn = reducerFn(initialState, actions);
    const res1 = fn(initialState, { type: actions.actionFetch });
    expect({
      api: {
        empty: false,
        loading: true,
        error: null,
        syncing: false,
        request: {}
      },
      msg: "Hello"
    }).to.eql(res1);

    const res2 = fn(initialState, {
      type: actions.actionSuccess,
      data: { items: [] }
    });
    expect({
      api: {
        empty: true,
        loading: false,
        error: null,
        sync: true,
        syncing: false
      },
      items: []
    }).to.eql(res2);

    const res3 = fn(initialState, { type: actions.actionFail, error: "Error" });
    expect({
      api: {
        empty: false,
        loading: false,
        error: "Error",
        syncing: false
      },
      msg: "Hello"
    }).to.eql(res3);

    const res4 = fn(initialState, { type: actions.actionReset });
    expect(res4).to.deep.eq(initialState);

    const res5 = fn(undefined, { type: "fake" });
    expect(res5).to.deep.eq(initialState);
  });

  it("check with path variables", function() {
    const initialState = { msg: "Hello" };
    const actions = {
      actionFetch: "actionFetch",
      actionSuccess: "actionSuccess",
      actionFail: "actionFail",
      actionReset: "actionReset"
    };
    const fn = reducerFn(initialState, actions);

    const res1 = fn(initialState, {
      type: actions.actionFetch,
      request: { pathvars: { id: 42 } }
    });
    expect({
      api: {
        empty: false,
        loading: true,
        error: null,
        syncing: false,
        request: {
          pathvars: { id: 42 }
        }
      },
      msg: "Hello"
    }).to.eql(res1);

    const res2 = fn(res1, {
      type: actions.actionSuccess,
      data: { items: [55] }
    });
    expect({
      api: {
        empty: false,
        loading: false,
        error: null,
        sync: true,
        syncing: false,
        request: {
          pathvars: { id: 42 }
        }
      },
      items: [55]
    }).to.eql(res2);

    const res3 = fn(res1, { type: actions.actionFail, error: "Error" });
    expect({
      api: {
        empty: false,
        loading: false,
        error: "Error",
        syncing: false,
        request: {
          pathvars: { id: 42 }
        }
      },
      msg: "Hello"
    }).to.eql(res3);

    const res4 = fn(res2, { type: actions.actionReset });
    expect(res4).to.deep.eq(initialState);

    const res5 = fn(undefined, { type: "fake" });
    expect(res5).to.deep.eq(initialState);
  });

  it("check with body", function() {
    const initialState = {
      api: {
        loading: false,
        request: null
      },
      msg: "Hello"
    };
    const actions = {
      actionFetch: "actionFetch",
      actionSuccess: "actionSuccess",
      actionFail: "actionFail",
      actionReset: "actionReset"
    };
    const fn = reducerFn(initialState, actions);

    const res1 = fn(initialState, {
      type: actions.actionFetch,
      request: {
        pathvars: { other: "var" },
        params: {
          method: "post",
          body: { hello: "world", it: { should: { store: " the body" } } }
        }
      }
    });
    expect({
      api: {
        empty: false,
        loading: true,
        error: null,
        syncing: false,
        request: {
          pathvars: { other: "var" },
          params: {
            method: "post",
            body: { hello: "world", it: { should: { store: " the body" } } }
          }
        }
      },
      msg: "Hello"
    }).to.eql(res1);

    const res2 = fn(res1, { type: actions.actionSuccess, data: { items: [] } });
    expect({
      api: {
        empty: true,
        loading: false,
        error: null,
        sync: true,
        syncing: false,
        request: {
          pathvars: { other: "var" },
          params: {
            method: "post",
            body: { hello: "world", it: { should: { store: " the body" } } }
          }
        }
      },
      items: []
    }).to.eql(res2);

    const res3 = fn(res1, { type: actions.actionFail, error: "Error" });
    expect({
      api: {
        empty: false,
        loading: false,
        error: "Error",
        syncing: false,
        request: {
          pathvars: { other: "var" },
          params: {
            method: "post",
            body: {
              hello: "world",
              it: { should: { store: " the body" } }
            }
          }
        }
      },
      msg: "Hello"
    }).to.eql(res3);

    const res4 = fn(res2, { type: actions.actionReset });
    expect(res4).to.deep.eq(initialState);

    const res5 = fn(undefined, { type: "fake" });
    expect(res5).to.deep.eq(initialState);
  });

  it("check injected reducer", function() {
    const initialState = { loading: false, data: { msg: "Hello" } };
    const actions = {
      actionFetch: "actionFetch",
      actionSuccess: "actionSuccess",
      actionFail: "actionFail",
      actionReset: "actionReset"
    };
    const fn = reducerFn(initialState, actions, (state, action) => {
      if (action.type === "CUSTOM") {
        return { ...state, data: "custom" };
      } else {
        return state;
      }
    });
    const res0 = fn(initialState, { type: "NO_WAY" });
    expect(res0 === initialState).to.be.true;

    const res1 = fn(initialState, { type: "CUSTOM" });
    expect(res1).to.eql({ loading: false, data: "custom" });
  });
});
