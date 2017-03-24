export const Manager = {
  expire: false,
  id(params) {
    if (!params) { return ""; }
    return Object.keys(params).reduce(
      (memo, key)=> memo + `${key}=${params[key]};`, "");
  }
};

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
