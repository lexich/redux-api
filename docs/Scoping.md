If you want use multipoint redux-api or separate your reducers by scope.
```js
const rest1 = reduxApi({
  test: "/test1",
}, { prefix: "r1" }); // <-- important to scoping

const rest2 = reduxApi({
  test: "/test2"
}, { prefix: "r2" }); // <-- important to scoping

const reducer = combineReducers({
  r1: combineReducers(rest1.reducers), // <-- the same scope (r1)
  r2: combineReducers(rest2.reducers), // <-- as in prefix   (r2)
  r3: combineReducers(myReducers)
});

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const store = createStoreWithMiddleware(reducer);
// etc

// You should remember that scoping modify structure of your state
// state of rest1 is
const dataOfRest1Test = store.getState().r1.test.data;
const dataOfRest2Test = store.getState().r2.test.data;
const other = store.getState().r3.other;
```
