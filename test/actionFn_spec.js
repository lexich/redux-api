"use strict";
/*global describe, it*/

var expect = require("chai").expect;
var actionFn = require("../lib/actionFn");
var isFunction = require("lodash/lang/isFunction");

function fetchSuccess() {
  return new Promise(function(resolve) {
    resolve({
      json: function() {
        return {msg: "hello"};
      }
    });
  });
}

function getState() {
  return {test: {loading: false, data: {}}};
}

function fetchFail() {
  return new Promise(function(resolve, reject) {
    reject("Error");
  });
}

describe("actionFn", function() {
  it("check null params", function() {
    var api = actionFn();
    expect(isFunction(api)).to.be.true;
  });
  it("check normal usage", function(done) {
    var api = actionFn("/test", "test", null, {
      actionFetch: "actionFetch",
      actionSuccess: "actionSuccess",
      actionFail: "actionFail",
      actionReset: "actionReset"
    }, fetchSuccess);
    expect(api.reset()).to.eql({type: "actionReset"});
    var action = api();
    expect(isFunction(action)).to.be.true;

    var expectedEvent = [
      {
        type: "actionFetch"
      }, {
        type: "actionSuccess",
        data: {msg: "hello"}
      }
    ];
    function dispatch(msg) {
      expect(expectedEvent).to.have.length.above(0);
      var exp = expectedEvent.shift();
      expect(msg).to.eql(exp);
      !expectedEvent.length && done();
    }

    action(dispatch, getState);
  });
  it("check fail fetch", function(done) {
    var api = actionFn("/test", "test", null, {
      actionFetch: "actionFetch",
      actionSuccess: "actionSuccess",
      actionFail: "actionFail",
      actionReset: "actionReset"
    }, fetchFail);

    var expectedEvent = [
      {
        type: "actionFetch"
      }, {
        type: "actionFail",
        error: "Error"
      }
    ];
    function dispatch(msg) {
      expect(expectedEvent).to.have.length.above(0);
      var exp = expectedEvent.shift();
      expect(msg).to.eql(exp);
      !expectedEvent.length && done();
    }
    api()(dispatch, getState);
  });
});
