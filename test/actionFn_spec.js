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
  return {
    "@redux-api": { server: false },
    test: {loading: false, syncing: false, sync: false, data: {}}
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
    const initialState = getState();
    initialState.test.sync = true;
    let executeCounter = 0;
    const api = actionFn("/test", "test", null, ACTIONS, ()=> {
      executeCounter++;
      return fetchSuccess();
    });
    api.sync()(function() {}, ()=> initialState);
    expect(executeCounter).to.be.eql(0);

    const expectedEvent = [{
      type: ACTIONS.actionFetch,
      syncing: true
    }, {
      type: ACTIONS.actionSuccess,
      data: {msg: "hello"},
      syncing: false
    }];
    api.sync()((msg)=> {
      expect(expectedEvent).to.have.length.above(0);
      const exp = expectedEvent.shift();
      expect(msg).to.eql(exp);
    }, getState);
    expect(executeCounter).to.be.eql(1);
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

  it("check options param", function() {
    let callOptions = 0;
    let checkOptions = null;
    const api = actionFn("/test/:id", "test", function(url, params) {
      callOptions++;
      return { ...params,  test: 1 };
    }, ACTIONS, function(url, opts) {
      checkOptions = opts;
      return fetchSuccess();
    });
    function dispatch() {}
    api("", {params: 1})(dispatch, getState);
    expect(callOptions).to.eql(1);
    expect(checkOptions).to.eql({params: 1, test: 1});
  });
});
