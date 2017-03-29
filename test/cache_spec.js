/* global describe, it */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}], no-void: 0 */

import { expect } from "chai";
import cache, { Manager, setExpire, getCacheManager, MockNowDate } from "../src/utils/cache";

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
    MockNowDate.push(date);
    const res1 = (+setExpire(1, date)) - (+date);
    expect(res1).to.eql(1 * SECOND);


    MockNowDate.push(date);
    const res2 = setExpire(false, date);
    expect(res2).to.eql(false);

    const date1000 = new Date(date);
    date1000.setSeconds(1000 + date1000.getSeconds());
    const res3 = setExpire(date1000, date, date);
    expect(res3).to.eql(date1000);
  });

  it("check getCacheManager null check", ()=> {
    const ret1 = getCacheManager();
    expect(ret1).to.be.null;
  });

  it("check getCacheManager only expire without cache", ()=> {
    const ret2 = getCacheManager(1);
    expect(ret2.expire).to.be.false; // can't rewrite false expire
    expect(ret2.getData).to.be.instanceof(Function);
    expect(ret2.id).to.be.instanceof(Function);
  });

  it("check getCacheManager full check", ()=> {
    const date = new Date();
    const ret3 = getCacheManager(1, { expire: date });

    expect(ret3.expire).to.be.instanceof(Date);
    expect(ret3.getData).to.be.instanceof(Function);
    expect(ret3.id).to.be.instanceof(Function);
  });

  it("check getCacheManager check only cache", ()=> {
    const date = new Date();
    const cache = { expire: date };
    const ret3 = getCacheManager(undefined, cache);

    expect(ret3.expire).to.be.eql(cache.expire);
    expect(ret3.getData).to.be.instanceof(Function);
    expect(ret3.id).to.be.instanceof(Function);
  });

  it("check Manager.getData empty args", ()=> {
    expect(Manager.getData()).to.not.exist;
  });

  it("check Manager.getData with only data cache", ()=> {
    expect(Manager.getData({ data: "Test" })).to.eql("Test");
    expect(Manager.getData({ data: "Test", expire: false })).to.eql("Test");
    expect(Manager.getData({ data: "Test", expire: null })).to.eql("Test");
  });

  it("check Manager.getData with only data cache", ()=> {
    const now = new Date();
    const before = new Date(now);
    before.setSeconds(before.getSeconds() - 1);
    const after = new Date(now);
    after.setSeconds(after.getSeconds() + 1);

    MockNowDate.push(now);
    expect(Manager.getData({ data: "Test", expire: after })).to.eql("Test");

    MockNowDate.push(now);
    expect(Manager.getData({ data: "Test", expire: before })).to.not.exist;
  });
});
