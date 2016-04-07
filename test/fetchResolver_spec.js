"use strict";
/* global describe, it */

import { expect } from "chai";
import fetchResolver from "../src/fetchResolver";
import isFunction from "lodash/isFunction";

describe("fetchResolver", function() {
  it("check import", function() {
    expect(isFunction(fetchResolver)).to.be.true;
  });
  it("check null params", function() {
    expect(fetchResolver()).to.be.undefined;
  });
  it("check with incorrect index§", function() {
    expect(fetchResolver(999)).to.be.undefined;
  });
  it("call without callback", function() {
    expect(fetchResolver(0, {
      prefetch: [(opts, cb)=> cb()]
    })).to.be.undefined;
  });
  it("check normal usage", function() {
    const result = [];
    const opts = {
      prefetch: [
        function(opts, cb) {
          result.push(["one", opts]);
          cb();
        },
        function(opts, cb) {
          result.push(["two", opts]);
          cb();
        }
      ]
    };
    fetchResolver(0, opts,
      ()=> result.push("ok"));
    expect(result).to.eql([
      ["one", opts],
      ["two", opts],
      "ok"
    ]);
  });
  it("check usage without prefetch options", function() {
    let counter = 0;
    fetchResolver(0, {}, ()=> counter++);
    expect(counter).to.eql(1);
  });
});
