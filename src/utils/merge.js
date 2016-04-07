const toString = Object.prototype.toString;
const OBJECT = "[object Object]";

export function mergePair(a, b) {
  if (a === (void 0)) { return b; }
  if (b === (void 0)) { return a; }
  if (toString.call(a) !== OBJECT || toString.call(b) !== OBJECT) {
    return b;
  }
  return Object.keys(b).reduce((memo, key)=> {
    memo[key] = mergePair(a[key], b[key]);
    return memo;
  }, a);
}

export default function(...args) {
  return args.length ? args.reduce(mergePair) : null;
}
