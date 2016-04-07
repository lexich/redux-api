"use strict";
/* global describe, it */

import { expect } from "chai";
import merge from "../src/utils/merge";


describe("merge", function() {
  it("check null args", function() {
    expect(merge()).to.not.exit;
    expect(merge(void 0)).to.not.exit;
    expect(merge(null)).to.not.exit;
    expect(merge(null, null)).to.not.exit;
    expect(merge(null, null, null)).to.not.exit;
  });

  it("check number", function() {
    expect(merge(1)).to.eql(1);
    expect(merge(0)).to.eql(0);
    expect(merge(1, 0)).to.eql(0);
    expect(merge(1, 2)).to.eql(2);
    expect(merge(1, 2, 3)).to.eql(3);
  });

  it("check string", function() {
    expect(merge("Hello")).to.eql("Hello");
    expect(merge("Hello", "World")).to.eql("World");
    expect(merge("Hello", "World", "Kitty")).to.eql("Kitty");
  });

  it("check boolean", function() {
    expect(merge(true)).to.eql(true);
    expect(merge(true, false)).to.eql(false);
  });

  it("merge plain object", function() {
    expect(
      merge({ a: 1 }, { b: 2 })
    ).to.eql({ a: 1, b: 2 });
    expect(
      merge({ a: 1 }, { b: 2 }, { c: 3 })
    ).to.eql({ a: 1, b: 2, c: 3 });
    expect(
      merge({ a: { c: 2 } }, { b: 2 })
    ).to.eql({ a: { c: 2 }, b: 2 });
  });

  it("deep merge object", function() {
    expect(
      merge({ a: { b: 1 } }, { a: { c: 2 } })
    ).to.eql(
      { a: { b: 1, c: 2 } }
    );
  });
});
