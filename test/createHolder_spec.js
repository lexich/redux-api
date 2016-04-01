"use strict";
/* global describe, it, beforeEach */

import { expect } from "chai";
import createHolder from "../src/createHolder";

describe("Holder", function() {
  beforeEach(function() {
    this.holder = createHolder();
  });
  it("default state", function() {
    expect(this.holder.empty()).to.be.true;
    expect(this.holder.pop()).not.to.exits;
  });
  it("normal usage", function() {
    const ptr = {};
    expect(this.holder.empty()).to.be.true;
    expect(this.holder.set(ptr)).to.be.true;
    expect(this.holder.empty()).to.be.false;

    expect(this.holder.set(1)).to.be.false;
    expect(this.holder.set(null)).to.be.false;
    expect(this.holder.pop() === ptr).to.be.true;
    expect(this.holder.empty()).to.be.true;
  });
});
