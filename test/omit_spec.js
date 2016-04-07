"use strict";
/* global describe, it */

import { expect } from "chai";
import omit from "../src/utils/omit";

describe("omit", function() {
  it("check without params", function() {
    const object = { a: 1, b: 2, c: 3 };
    const result = omit(object);
    expect(result).to.eql(object);
    expect(result !== object).to.be.true;
  });
  it("check without params", function() {
    const object = { a: 1, b: 2, c: 3 };
    const result = omit(object, []);
    expect(result).to.eql(object);
    expect(result !== object).to.be.true;
  });
  it("check omit", function() {
    const object = { a: 1, b: 2, c: 3 };
    const result = omit(object, ["a", "b"]);
    expect(result).to.eql({ c: 3 });
  });
  it("check omit", function() {
    const object = { a: 1, b: 2, c: 3 };
    const result = omit(object, ["a", "b", "d"]);
    expect(result).to.eql({ c: 3 });
  });
});
