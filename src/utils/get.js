"use strict";

/* eslint no-void: 0 */
function isEmpty(name) {
  return name === "" || name === null || name === (void 0);
}

export default function (obj, ...path) {
  return path.reduce(
    (memo, name)=> isEmpty(name) ? memo : (memo && memo[name])
  , obj);
}
