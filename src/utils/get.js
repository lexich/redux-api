"use strict";

/* eslint no-void: 0 */
function isEmpty(name) {
  return name === "" || name === null || name === void 0;
}

function get(obj, ...path) {
  return path.reduce(
    (memo, name) =>
      Array.isArray(name)
        ? get(memo, ...name)
        : isEmpty(name)
        ? memo
        : memo && memo[name],
    obj
  );
}

export default get;
