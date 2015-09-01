"use strict";
/* global describe, it */

const expect = require("chai").expect;
const actionFn = require("../src/actionFn");
const isFunction = require("lodash/lang/isFunction");

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
    const api = actionFn("/test", "test", null, ACTIONS, fetchSuccess);
    const expectedEvent = [
      {
        type: ACTIONS.actionFetch
      }, {
        type: ACTIONS.actionSuccess,
        data: {msg: "hello"}
      }
    ];
    function dispatch(msg) {
      expect(expectedEvent).to.have.length.above(0);
      const exp = expectedEvent.shift();
      expect(msg).to.eql(exp);
    }
    api.sync()(dispatch, getState);
    api.sync()(dispatch, getState);
  });
  it("check normal usage", function() {
    const api = actionFn("/test", "test", null, ACTIONS, fetchSuccess);
    expect(api.reset()).to.eql({type: ACTIONS.actionReset });
    const action = api();
    expect(isFunction(action)).to.be.true;

    const expectedEvent = [
      {
        type: ACTIONS.actionFetch,
        syncing: false
      }, {
        type: ACTIONS.actionSuccess,
        data: {msg: "hello"},
        syncing: false
      }
    ];
    function dispatch(msg) {
      expect(expectedEvent).to.have.length.above(0);
      const exp = expectedEvent.shift();
      expect(msg).to.eql(exp);
    }
    action(dispatch, getState);
  });
  it("check fail fetch", function() {
    const api = actionFn("/test", "test", null, ACTIONS, fetchFail);

    const expectedEvent = [
      {
        type: ACTIONS.actionFetch,
        syncing: false
      }, {
        type: ACTIONS.actionFail,
        error: "Error",
        syncing: false
      }
    ];
    function dispatch(msg) {
      expect(expectedEvent).to.have.length.above(0);
      const exp = expectedEvent.shift();
      expect(msg).to.eql(exp);
    }
    api()(dispatch, getState);
  });
  it("check double request", function() {
    const api = actionFn("/test/:id", "test", null, ACTIONS, fetchSuccess);
    function dispatch(msg) {
      expect(msg, "dispatch mustn't call").to.be.false;
    }
    api({id: 1})(dispatch, function() {
      return {test: {loading: true, data: {}}};
    });
  });
});
