"use strict";

export default class PubSub {
  constructor() {
    this.container = [];
  }
  push(cb) {
    cb instanceof Function && this.container.push(cb);
  }
  resolve(data) {
    const container = this.container;
    this.container = [];
    container.forEach(cb => cb(null, data));
  }
  reject(err) {
    const container = this.container;
    this.container = [];
    container.forEach(cb => cb(err));
  }
}
