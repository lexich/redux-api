export default function(object, props) {
  if (!Array.isArray(props)) {
    return { ...object };
  }

  return Object.keys(object || {}).reduce((memo, key)=> {
    if (props.indexOf(key) === -1) {
      memo[key] = object[key];
    }
    return memo;
  }, {});
}
