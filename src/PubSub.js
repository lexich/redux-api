"use strict";

export default class PubSub {
  constructor() {
    this.container = [];
  }
  push(cb) {
    (cb instanceof Function) && this.container.push(cb);
  }
  resolve(data) {
    this.container.forEach((cb)=> cb(null, data));
    this.container = [];
  }
  reject(err) {
    this.container.forEach((cb)=> cb(err));
    this.container = [];
  }
}
