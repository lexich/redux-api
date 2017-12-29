export function none() {}

export function extractArgs(args) {
  let pathvars;
  let params = {};
  let callback;
  if (args[0] instanceof Function) {
    callback = args[0];
  } else if (args[1] instanceof Function) {
    pathvars = args[0];
    callback = args[1];
  } else {
    pathvars = args[0];
    params = args[1];
    callback = args[2] || none;
  }
  return [pathvars, params, callback];
}

export function helperCrudFunction(name) {
  return (...args) => {
    const [pathvars, params, cb] = extractArgs(args);
    return [pathvars, { ...params, method: name.toUpperCase() }, cb];
  };
}

export function defaultMiddlewareArgsParser(dispatch, getState) {
  return { dispatch, getState };
}

export const CRUD = ["get", "post", "put", "delete", "patch"].reduce(
  (memo, name) => {
    memo[name] = helperCrudFunction(name);
    return memo;
  },
  {}
);
