"use strict";
/* global describe, it */

const expect = require("chai").expect;
const reduxApi = require("../src/index.js").default;
const transformers = require("../src/index.js").transformers;
const isFunction = require("lodash/lang/isFunction");
const size = require("lodash/collection/size");

function getState() {
  return {test: {loading: false, data: {}}};
}

describe("index", function() {
  it("check transformers", function() {
    expect(transformers.array()).to.eql([]);
    expect(transformers.array({id: 1})).to.eql([{id: 1}]);
    expect(transformers.array([1])).to.eql([1]);

    expect(transformers.object()).to.eql({});
    expect(transformers.object({id: 1})).to.eql({id: 1});
    expect(transformers.object([1])).to.eql({data: [1]});
    expect(transformers.object("test")).to.eql({data: "test"});
    expect(transformers.object(1)).to.eql({data: 1});
    expect(transformers.object(true)).to.eql({data: true});
  });
  it("check null params", function() {
    expect(isFunction(reduxApi)).to.be.true;
    expect(reduxApi()).to.eql({
      actions: {}, reducers: {}
    });
  });
  it("check string url", function() {
    function fetchSuccess(url, data) {
      expect(url).to.eql("/plain/url");
      expect(data).to.eql({});
      return new Promise(function(resolve) {
        resolve({
          json: function() {
            return {msg: "hello"};
          }
        });
      });
    }
    const res = reduxApi({
      test: "/plain/url"
    }, fetchSuccess);
    expect(size(res.actions)).to.eql(1);
    expect(size(res.reducers)).to.eql(1);
    expect(res.actions.test).to.exist;
    expect(res.reducers.test).to.exist;
    const action = res.actions.test();
    const expectedEvent = [
      {
        type: "@@redux-api@1@test",
        syncing: false
      }, {
        type: "@@redux-api@1@test_success",
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
  it("check object url", function() {
    function fetchSuccess(url, options) {
      expect(url).to.eql("/plain/url/1");
      expect(options).to.eql({
        headers: {
          "Accept": "application/json"
        }
      });
      return new Promise(function(resolve) {
        resolve({
          json: function() {
            return {msg: "hello"};
          }
        });
      });
    }
    const res = reduxApi({
      test: {
        url: "/plain/url/:id",
        options: {
          headers: {
            "Accept": "application/json"
          }
        }
      }
    }, fetchSuccess);
    expect(res.actions.test).to.exist;
    expect(res.reducers.test).to.exist;
    const action = res.actions.test({id: 1});
    const expectedEvent = [
      {
        type: "@@redux-api@2@test",
        syncing: false
      }, {
        type: "@@redux-api@2@test_success",
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
  it("use provided reducerName when avaliable", function() {
    const res = reduxApi({
      test: {
        reducerName: "foo",
        url: "/plain/url/:id",
        options: {
          headers: {
            "Accept": "application/json"
          }
        }
      }
    }, function fetchSuccess() {});
    expect(res.actions.test).to.exist;
    expect(res.reducers.test).to.not.exist;
    expect(res.reducers.foo).to.exist;
  });
});
