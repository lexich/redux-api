export const Manager = {
  expire: false,
  getData(cache, now) {
    if (!cache) { return; }
    const { expire, data } = cache;
    if (expire === false || expire === undefined || expire === null) {
      return data;
    }
    if (expire instanceof Date) {
      if (expire.valueOf() > (now || new Date()).valueOf()) {
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

export function setExpire(value, oldDate, now) {
  let expire = value;
  if (oldDate instanceof Date) {
    if (typeof expire === "number" || expire instanceof Number) {
      const d = now ? new Date(now) : new Date();
      d.setSeconds(d.getSeconds() + expire);
      expire = d;
    }
    if (expire instanceof Date) {
      if (expire.valueOf() < oldDate.valueOf()) {
        expire = oldDate;
      }
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
