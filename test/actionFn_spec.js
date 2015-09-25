"use strict";
/* global describe, it */

const expect = require("chai").expect;
const actionFn = require("../src/actionFn");
const isFunction = require("lodash/lang/isFunction");

function fetchSuccess() {
  return new Promise(function(resolve) {
    resolve({ msg: "hello"});
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
    let executeCounter = 0;
    const api = actionFn("/test", "test", null, ACTIONS, ()=> {
      executeCounter++;
      return fetchSuccess();
    });

    const async1 = new Promise((resolve)=> {
      const initialState = getState();
      initialState.test.sync = true;

      api.sync(null, null, resolve)(function() {}, ()=> initialState);
      expect(executeCounter).to.be.eql(0);
    });

    const expectedEvent = [{
      type: ACTIONS.actionFetch,
      syncing: true
    }, {
      type: ACTIONS.actionSuccess,
      data: {msg: "hello"},
      syncing: false
    }];
    const async2 = new Promise((resolve)=> {
      api.sync(null, null, resolve)((msg)=> {
        expect(expectedEvent).to.have.length.above(0);
        const exp = expectedEvent.shift();
        expect(msg).to.eql(exp);
      }, getState);
    }).then(()=> {
      expect(executeCounter).to.be.eql(1);
      expect(expectedEvent).to.have.length(0);
    });

    return Promise.all([async1, async2]);
  });

  it("check normal usage", function() {
    const api = actionFn("/test", "test", null, ACTIONS, fetchSuccess);
    expect(api.reset()).to.eql({type: ACTIONS.actionReset });
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
    return new Promise((resolve)=> {
      const action = api(null, null, resolve);
      expect(isFunction(action)).to.be.true;


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
    return new Promise((resolve)=> {
      api(null, null, resolve)(dispatch, getState);
    }).then(()=> {
      expect(expectedEvent).to.have.length(0);
    });
  });

  it("check double request", function() {
    const api = actionFn("/test/:id", "test", null, ACTIONS, fetchSuccess);
    function dispatch(msg) {
      expect(msg, "dispatch mustn't call").to.be.false;
    }
    return new Promise((resolve)=> {
      api({id: 1}, null, resolve)(dispatch, function() {
        return {test: {loading: true, data: {}}};
      });
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
    return new Promise((resolve)=> {
      api("", {params: 1}, resolve)(dispatch, getState);
      expect(callOptions).to.eql(1);
      expect(checkOptions).to.eql({params: 1, test: 1});
    });
  });

  it("check server mode", function() {
    function getServerState() {
      return {
        "@redux-api": { server: true },
        test: {loading: false, syncing: false, sync: true, data: {}}
      };
    }
    const api = actionFn("/test/:id", "test", null, ACTIONS, fetchSuccess);

    const expectedEvent = [
      { type: "actionFetch", syncing: true },
      { type: "actionSuccess", syncing: false, data: { msg: "hello" } }
    ];
    return new Promise((resolve)=> {
      api.sync(null, null, resolve)(function(msg) {
        expect(expectedEvent).to.have.length.above(0);
        const exp = expectedEvent.shift();
        expect(msg).to.eql(exp);
      }, getServerState);
    }).then(()=> {
      expect(expectedEvent).to.have.length(0);
    });
  });

  });
});
