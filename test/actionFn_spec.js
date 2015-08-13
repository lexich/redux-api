"use strict";
/*global describe, it*/

var expect = require("chai").expect;
var actionFn = require("../src/actionFn");
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
  return {test: {loading: false, sync: true, data: {}}};
}

function fetchFail() {
  return new Promise(function(resolve, reject) {
    reject("Error");
  });
}

var ACTIONS = {
  actionFetch: "actionFetch",
  actionSuccess: "actionSuccess",
  actionFail: "actionFail",
  actionReset: "actionReset"
};

describe("actionFn", function() {
  it("check null params", function() {
    var api = actionFn();
    expect(isFunction(api)).to.be.true;
  });
  it("check sync method", function() {
    var api = actionFn("/test", "test", null, ACTIONS, fetchSuccess);
    var expectedEvent = [
      {
        type: ACTIONS.actionFetch
      }, {
        type: ACTIONS.actionSuccess,
        data: {msg: "hello"}
      }
    ];
    function dispatch(msg) {
      expect(expectedEvent).to.have.length.above(0);
      var exp = expectedEvent.shift();
      expect(msg).to.eql(exp);
    }
    api.sync()(dispatch, getState);
    api.sync()(dispatch, getState);
  });
  it("check normal usage", function() {
    var api = actionFn("/test", "test", null, ACTIONS, fetchSuccess);
    expect(api.reset()).to.eql({type: ACTIONS.actionReset });
    var action = api();
    expect(isFunction(action)).to.be.true;

    var expectedEvent = [
      {
        type: ACTIONS.actionFetch
      }, {
        type: ACTIONS.actionSuccess,
        data: {msg: "hello"}
      }
    ];
    function dispatch(msg) {
      expect(expectedEvent).to.have.length.above(0);
      var exp = expectedEvent.shift();
      expect(msg).to.eql(exp);
    }
    action(dispatch, getState);
  });
  it("check fail fetch", function() {
    var api = actionFn("/test", "test", null, ACTIONS, fetchFail);

    var expectedEvent = [
      {
        type: ACTIONS.actionFetch
      }, {
        type: ACTIONS.actionFail,
        error: "Error"
      }
    ];
    function dispatch(msg) {
      expect(expectedEvent).to.have.length.above(0);
      var exp = expectedEvent.shift();
      expect(msg).to.eql(exp);
    }
    api()(dispatch, getState);
  });
  it("check double request", function() {
    var api = actionFn("/test/:id", "test", null, ACTIONS, fetchSuccess);
    function dispatch(msg) {
      expect(msg, "dispatch mustn't call").to.be.false;
    }
    api({id: 1})(dispatch, function() {
      return {test: {loading: true, data: {}}};
    });
  });
});
