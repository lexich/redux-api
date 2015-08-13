"use strict";
/*global describe, it*/

var expect = require("chai").expect;
var reduxApi = require("../src/index.js").default;
var transformers = require("../src/index.js").transformers;
var isFunction = require("lodash/lang/isFunction");
var size = require("lodash/collection/size");

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
  it("check string url", function(done) {
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
    var res = reduxApi({
      test: "/plain/url"
    }, fetchSuccess);
    expect(size(res.actions)).to.eql(1);
    expect(size(res.reducers)).to.eql(1);
    expect(res.actions.test).to.exist;
    expect(res.reducers.test).to.exist;
    var action = res.actions.test();
    var expectedEvent = [
      {
        type: "@@redux-api@1@test"
      }, {
        type: "@@redux-api@1@test_success",
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
  it("check object url", function(done) {
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
    var res = reduxApi({
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
    var action = res.actions.test({id: 1});
    var expectedEvent = [
      {
        type: "@@redux-api@2@test"
      }, {
        type: "@@redux-api@2@test_success",
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
});
