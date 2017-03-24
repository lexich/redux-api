/* global describe, it */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}], no-void: 0 */

import { expect } from "chai";
import cache, { Manager } from "../src/cache-manager";

describe("cache-manager", ()=> {
  it("check empty call", ()=> {
    expect(cache()).to.not.exist;
    expect(cache(null)).to.not.exist;
    expect(cache(false)).to.not.exist;
  });

  it("check cache as true", ()=> {
    const manager = cache(true);
    expect(manager === Manager).to.be.true;
    expect(manager.id).to.exist;
    expect(manager.id({ a: 1, b: 2 })).to.eql("a=1;b=2;");
  });

  it("check cache rewrite id", ()=> {
    const manager = cache({
      id(params, opts) {
        return Manager.id(params) + opts;
      }
    });
    expect(manager.id({ a: 1, b: 2 }, "extra")).to.eql("a=1;b=2;extra");
  });
});
