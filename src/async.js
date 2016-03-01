/**
 *
 * @param  {[type]}    dispatch [description]
 * @param  {...[type]} args     [description]
 * @return {[type]}             [description]
 * @example
 * async(dispatch,
 *   (cb)=> actions.test(1, cb),
 *   actions.test2
 * ).then(()=> async(dispatch, actions.test3))
 */
export default function async(dispatch, ...args) {
  const fn = args[0];
  const nextArgs = args.slice(1);
  return new Promise(
    (resolve, reject)=> {
      if (!fn) {
        reject("no chain function");
      } else {
        dispatch(fn((err, data)=> {
          err ? reject(err) : resolve(data);
        }) || {});
      }
    })
  .then((data)=> {
    if (nextArgs.length) {
      return async(dispatch, ...nextArgs);
    } else {
      return data;
    }
  });
}
