"use strict";
/* global describe, it */

var expect = require("chai").expect;
var urlTransform = require("../src/urlTransform");

describe("urlTransform", function() {
  it("check null params", function() {
    expect(urlTransform()).to.be.undefined;
    expect(urlTransform(null)).to.be.null;
    expect(urlTransform("/test")).to.eql("/test");
  });
  it("check replace path", function() {
    expect(urlTransform("/test/:id", {id: 1})).to.eql("/test/1");
    expect(urlTransform("/test/:id/hey/:id", {id: 1})).to.eql("/test/1/hey/1");
  });
  it("check optional params path", function() {
    expect(urlTransform("/test/:id", {id: 1})).to.eql("/test/1");
    expect(urlTransform("/test/(:id)", {id: 1})).to.eql("/test/1");
    expect(urlTransform("/test/(:id)")).to.eql("/test/");
  });
  it("chech non-pretty params in path", function() {
    expect(urlTransform("/test/(:id)", {id1: 1})).to.eql("/test/?id1=1");
  });
});
