/* eslint no-void: 0 */
const toString = Object.prototype.toString;
const OBJECT = "[object Object]";
const ARRAY = "[object Array]";

export function mergePair(a, b) {
  if (a === void 0) {
    return b;
  }
  if (b === void 0) {
    return a;
  }

  const aType = toString.call(a);
  const bType = toString.call(b);
  if (aType === ARRAY) {
    return a.concat(b);
  }
  if (bType === ARRAY) {
    return [a].concat(b);
  }
  if (aType !== OBJECT || bType !== OBJECT) {
    return b;
  }
  return Object.keys(b).reduce((memo, key) => {
    memo[key] = mergePair(a[key], b[key]);
    return memo;
  }, a);
}

export default function(...args) {
  return args.length ? args.reduce(mergePair) : null;
}
