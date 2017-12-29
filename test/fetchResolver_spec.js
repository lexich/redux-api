"use strict";

/* global describe, it */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
import { expect } from "chai";
import isFunction from "lodash/isFunction";
import fetchResolver from "../src/fetchResolver";

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
    expect(
      fetchResolver(0, {
        prefetch: [(opts, cb) => cb()]
      })
    ).to.be.undefined;
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
    fetchResolver(0, opts, () => result.push("ok"));
    expect(result).to.eql([["one", opts], ["two", opts], "ok"]);
  });
  it("check usage without prefetch options", function() {
    let counter = 0;
    fetchResolver(0, {}, () => {
      counter += 1;
    });
    expect(counter).to.eql(1);
  });
});
