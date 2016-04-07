"use strict";
/* global describe, it */

import { expect } from "chai";
import reducerFn from "../src/reducerFn";
import isFunction from "lodash/isFunction";

describe("reducerFn", function() {
  it("check null params", function() {
    expect(isFunction(reducerFn)).to.be.true;
    const fn = reducerFn();
    expect(isFunction(fn)).to.be.true;
  });
  it("check", function() {
    const initialState = { loading: false, data: { msg: "Hello" } };
    const actions = {
      actionFetch: "actionFetch",
      actionSuccess: "actionSuccess",
      actionFail: "actionFail",
      actionReset: "actionReset"
    };
    const fn = reducerFn(initialState, actions);
    const res1 = fn(initialState, { type: actions.actionFetch });
    expect(res1).to.eql({
      loading: true, error: null, data: { msg: "Hello" }, syncing: false
    });

    const res2 = fn(initialState, { type: actions.actionSuccess, data: true });
    expect(res2).to.eql({
      loading: false, error: null, data: true, sync: true, syncing: false
    });

    const res3 = fn(initialState, { type: actions.actionFail, error: "Error" });
    expect(res3).to.eql({
      loading: false, error: "Error", data: { msg: "Hello" }, syncing: false
    });

    const res4 = fn(initialState, { type: actions.actionReset });
    expect(res4).to.eql(initialState);
    expect(res4 !== initialState).to.be.true;

    const res5 = fn(undefined, { type: "fake" });
    expect(res5 === initialState).to.be.true;
  });

  it("check injected reducer", function() {
    const initialState = { loading: false, data: { msg: "Hello" } };
    const actions = {
      actionFetch: "actionFetch",
      actionSuccess: "actionSuccess",
      actionFail: "actionFail",
      actionReset: "actionReset"
    };
    const fn = reducerFn(initialState, actions, (state, action)=> {
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
