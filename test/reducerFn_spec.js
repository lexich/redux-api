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
    const initialState = { loading: false, pathvars:{}, body:{}, data: { msg: "Hello" } };
    const actions = {
      actionFetch: "actionFetch",
      actionSuccess: "actionSuccess",
      actionFail: "actionFail",
      actionReset: "actionReset"
    };
    const fn = reducerFn(initialState, actions);
    const res1 = fn(initialState, { type: actions.actionFetch });
    expect(res1).to.eql({
      loading: true, error: null, data: { msg: "Hello" }, syncing: false, pathvars:{}, body:{}
    });
  
    const res2 = fn(initialState, { type: actions.actionSuccess, data: true });
    expect(res2).to.eql({
      loading: false, error: null, data: true, sync: true, syncing: false, pathvars:{}, body:{}
    });
    
    const res3 = fn(initialState, { type: actions.actionFail, error: "Error" });
    expect(res3).to.eql({
      loading: false, error: "Error", data: { msg: "Hello" }, syncing: false, pathvars:{}, body:{}
    });

    const res4 = fn(initialState, { type: actions.actionReset });
    expect(res4).to.deep.eq(initialState);

    const res5 = fn(undefined, { type: "fake" });
    expect(res5).to.deep.eq(initialState);
  });
  
  it("check with path variables", function() {
    const initialState = { loading: false, pathvars:{}, body:{}, data: { msg: "Hello" } };
    const actions = {
      actionFetch: "actionFetch",
      actionSuccess: "actionSuccess",
      actionFail: "actionFail",
      actionReset: "actionReset"
    };
    const fn = reducerFn(initialState, actions);
    
    const res1 = fn(initialState, { type: actions.actionFetch, pathvars: { id: 42 } });
    expect(res1).to.eql({
      loading: true, error: null, data: { msg: "Hello" }, syncing: false, pathvars:{ id: 42 }, body:{}
    });
    
    const res1c = fn(initialState, { type: actions.actionFetch, pathvars: { other: "var" }, params: { method: "post", body:{hello:"world"}} });
    expect(res1c).to.eql({
      loading: true, error: null, data: { msg: "Hello" }, syncing: false, pathvars:{ other: "var" }, body:{hello:"world"}
    });
    
    const res2 = fn(res1, { type: actions.actionSuccess, data: true });
    expect(res2).to.eql({
      loading: false, error: null, data: true, sync: true, syncing: false, pathvars:{ id: 42 }, body:{}
    });
    
    const res3 = fn(res1, { type: actions.actionFail, error: "Error" });
    expect(res3).to.eql({
      loading: false, error: "Error", data: { msg: "Hello" }, syncing: false, pathvars:{ id: 42 }, body:{}
    });
    
    const res4 = fn(res2, { type: actions.actionReset });
    expect(res4).to.deep.eq(initialState);
    
    const res5 = fn(undefined, { type: "fake" });
    expect(res5).to.deep.eq(initialState);
  });
  
  it("check with body", function() {
    const initialState = { loading: false, pathvars:{}, body:{}, data: { msg: "Hello" } };
    const actions = {
      actionFetch: "actionFetch",
      actionSuccess: "actionSuccess",
      actionFail: "actionFail",
      actionReset: "actionReset"
    };
    const fn = reducerFn(initialState, actions);
    
    const res1 = fn(initialState, { type: actions.actionFetch, pathvars: { other: "var" }, params: { method: "post", body:{hello:"world", it:{should:{store:' the body'}}}} });
    expect(res1).to.eql({
      loading: true, error: null, data: { msg: "Hello" }, syncing: false, pathvars:{ other: "var" }, body:{hello:"world", it:{should:{store:' the body'}}}
    });
    
    const res2 = fn(res1, { type: actions.actionSuccess, data: true });
    expect(res2).to.eql({
      loading: false, error: null, data: true, sync: true, syncing: false, pathvars:{ other: "var" }, body:{hello:"world", it:{should:{store:' the body'}}}
    });
    
    const res3 = fn(res1, { type: actions.actionFail, error: "Error" });
    expect(res3).to.eql({
      loading: false, error: "Error", data: { msg: "Hello" }, syncing: false, pathvars:{ other: "var" }, body:{hello:"world", it:{should:{store:' the body'}}}
    });
    
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
