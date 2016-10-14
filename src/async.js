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
export default function async(dispatch, currentFunction = null, ...restFunctions) {
  return new Promise(
    (resolve, reject)=> {
      if (!currentFunction) {
        reject("no chain function");
      } else {
        dispatch(currentFunction((err, data)=> {
          err ? reject(err) : resolve(data);
        }) || {});
      }
    })
  .then((data)=> {
    if (restFunctions.length) {
      return async(dispatch, ...restFunctions);
    } else {
      return data;
    }
  });
}
