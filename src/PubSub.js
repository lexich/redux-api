"use strict";

import isFunction from "lodash/lang/isFunction";

export default class PubSub {
  constructor() {
    this.container = [];
  }
  push(cb) {
    isFunction(cb) && this.container.push(cb);
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
