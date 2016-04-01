"use strict";

export default function() {
  let data;
  let hasData = false;
  return {
    set(val) {
      if (!hasData) {
        data = val;
        hasData = true;
        return true;
      }
      return false;
    },
    empty() {
      return !hasData;
    },
    pop() {
      if (hasData) {
        hasData = false;
        const result = data;
        data = null;
        return result;
      }
    }
  };
}
