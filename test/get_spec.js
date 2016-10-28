"use strict";

/* global describe, it */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}], no-void: 0 */
import { expect } from "chai";
import get from "../src/utils/get";


describe("get", function() {
  it("check `get` full path", function() {
    const obj = {
      a: { b: { c: 2 } }
    };
    const c = get(obj, "a", "b", "c");
    expect(c).to.eql(2);
  });

  it("check `get` with empty path", function() {
    const obj = {
      a: { b: { c: { 0: 2 } } }
    };
    const c = get(obj, "", "a", null, "b", (void 0), "c", 0);
    expect(c).to.eql(2);
  });

  it("check `get` incorrect path", function() {
    const obj = {
      a: { b: { c: 2 } }
    };
    const c = get(obj, "c", "b", "a");
    expect(c).to.not.exist;
  });
});
