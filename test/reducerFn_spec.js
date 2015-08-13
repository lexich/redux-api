"use strict";
/*global describe, it*/

var expect = require("chai").expect;
var reducerFn = require("../src/reducerFn");
var isFunction = require("lodash/lang/isFunction");

describe("reducerFn", function() {
  it("check null params", function() {
    expect(isFunction(reducerFn)).to.be.true;
    var fn = reducerFn();
    expect(isFunction(fn)).to.be.true;
  });
  it("check", function() {
    var initialState = {loading: false, data: {
      msg: "Hello"
    }};
    var actions = {
      actionFetch: "actionFetch",
      actionSuccess: "actionSuccess",
      actionFail: "actionFail",
      actionReset: "actionReset"
    };
    var fn = reducerFn(initialState, actions);
    var res1 = fn(initialState, {type: actions.actionFetch});
    expect(res1).to.eql({
      loading: true, error: null, data: { msg: "Hello" }
    });

    var res2 = fn(initialState, {type: actions.actionSuccess, data: true});
    expect(res2).to.eql({
      loading: false, error: null, data: true
    });

    var res3 = fn(initialState, {type: actions.actionFail, error: "Error"});
    expect(res3).to.eql({
      loading: false, error: "Error", data: { msg: "Hello" }
    });

    var res4 = fn(initialState, {type: actions.actionReset});
    expect(res4).to.eql(initialState);
    expect(res4 !== initialState).to.be.true;

    var res5 = fn(undefined, {type: "fake"});
    expect(res5 === initialState).to.be.true;
  });
});
