export const MockNowDate = {
  date: undefined,
  push(date) {
    this.date = date;
  },
  pop() {
    if (this.date) {
      const d = this.date;
      this.date = undefined;
      return new Date(d);
    } else {
      return new Date();
    }
  }
};

export const Manager = {
  expire: false,
  getData(cache) {
    if (!cache) { return; }
    const { expire, data } = cache;
    if (expire === false || expire === undefined || expire === null) {
      return data;
    }
    if (expire instanceof Date) {
      if (expire.valueOf() > MockNowDate.pop().valueOf()) {
        return data;
      }
    }
  },
  id(params) {
    if (!params) { return ""; }
    return Object.keys(params).reduce(
      (memo, key)=> memo + `${key}=${params[key]};`, "");
  }
};

export function setExpire(value, oldDate) {
  let expire = value;
  if (typeof expire === "number" || expire instanceof Number) {
    const d = MockNowDate.pop();
    d.setSeconds(d.getSeconds() + expire);
    expire = d;
  }
  if (oldDate instanceof Date && expire instanceof Date) {
    if (expire.valueOf() < oldDate.valueOf()) {
      expire = oldDate;
    }
  }
  return expire;
}

export function getCacheManager(expire, cache) {
  if (expire !== undefined) {
    const ret = { ...Manager, ...cache };
    if (ret.expire !== false) {
      ret.expire = setExpire(expire, ret.expire);
    }
    return ret;
  } else if (cache) {
    return { ...Manager, ...cache };
  } else {
    return null;
  }
}

export default function(cache) {
  if (!cache) {
    return null;
  }
  if (cache === true) {
    return Manager;
  } else {
    return { ...Manager, ...cache };
  }
}
