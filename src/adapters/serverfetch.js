function serverfetch() {
  const routes = {};
  return {
    new: serverfetch,
    make(name) {
      routes[name] = true;
      return (...args)=> {
        const fn = routes[name];
        if (typeof fn !== "function") {
          throw new Error(`Route ${name} wasn't defined`);
        } else {
          return fn(...args);
        }
      };
    },
    use(name, fn) {
      if (routes[name] === true) {
        routes[name] = (...args)=> new Promise(
          (resolve)=> resolve(fn(...args)));
      } else {
        throw new Error(`Route ${name} wasn't predefined`);
      }
    },
    get(name) {
      return routes[name];
    }
  };
}


export default serverfetch();
