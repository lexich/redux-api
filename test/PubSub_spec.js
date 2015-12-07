"use strict";
/* global describe, it */

import { expect } from "chai";
import PubSub from "../src/PubSub";

describe("PubSub", function() {
  it("constructor", function() {
    const pubsub = new PubSub();
    expect(pubsub.container).to.be.instanceOf(Array);
    expect(pubsub.container).to.have.length(0);
  });
  it("push", function() {
    const pubsub = new PubSub();
    pubsub.push();
    expect(pubsub.container).to.have.length(0);
    pubsub.push(function() {});
    expect(pubsub.container).to.have.length(1);
  });
  it("reject", function() {
    const expectArr = [];
    function ok1(err) {
      expectArr.push({ t: "ok1", err });
    }
    function ok2(err) {
      expectArr.push({ t: "ok2", err });
    }
    const pubsub = new PubSub();
    pubsub.push(ok1);
    pubsub.push(ok2);
    expect(pubsub.container).to.have.length(2);
    pubsub.reject("err");
    expect(pubsub.container).to.have.length(0);
    expect(expectArr).to.eql([
      { t: "ok1", err: "err" },
      { t: "ok2", err: "err" }
    ]);
  });
  it("resolve", function() {
    const expectArr = [];
    function ok1(err, data) {
      expectArr.push({ t: "ok1", err, data });
    }
    function ok2(err, data) {
      expectArr.push({ t: "ok2", err, data });
    }
    const pubsub = new PubSub();
    pubsub.push(ok1);
    pubsub.push(ok2);
    expect(pubsub.container).to.have.length(2);
    pubsub.resolve("ok");
    expect(pubsub.container).to.have.length(0);
    expect(expectArr).to.eql([
      { t: "ok1", err: null, data: "ok" },
      { t: "ok2", err: null, data: "ok" }
    ]);
  });
});
