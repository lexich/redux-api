/* global describe, it */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}], no-void: 0 */

import { expect } from "chai";
import cache, { Manager, setExpire } from "../src/utils/cache";

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

  it("check setExpire", ()=> {
    const date = new Date();
    const SECOND = 1000;
    const res1 = (+setExpire(1, date, date)) - (+date);
    expect(res1).to.eql(1 * SECOND);

    const res2 = setExpire(false, date, date);
    expect(res2).to.eql(false);

    const date1000 = new Date(date);
    date1000.setSeconds(1000 + date1000.getSeconds());
    const res3 = setExpire(date1000, date, date);
    expect(res3).to.eql(date1000);
  });

  it("check getCacheManager", ()=> {
    expect(false).to.eql(true, "need implement test");
  });

  it("check Manager.getData", ()=> {
    expect(false).to.eql(true, "need implement test");
  });
});
