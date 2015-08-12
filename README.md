
[![Build Status](https://travis-ci.org/lexich/redux-api.svg)](https://travis-ci.org/lexich/redux-api)
[![NPM version](https://badge.fury.io/js/redux-api.svg)](http://badge.fury.io/js/redux-api)
[![Coverage Status](https://coveralls.io/repos/lexich/redux-api/badge.png?branch=master)](https://coveralls.io/r/lexich/redux-api?branch=master)

### Redux-api

Inspired by [Redux-rest](https://github.com/Kvoti/redux-rest) and is recommended to work with [Redux](https://github.com/gaearon/redux).

## Install
with npm
```sh
npm instal redux-api --save
```
with bower
```sh
bower instal redux-api --save
```

Redux-api recommend to use `fetch` API for rest requests backend.
[whatwg-fetch](https://www.npmjs.com/package/whatwg-fetch) 

For example used es7 javascript, [Redux@1.0.0-rc](https://github.com/gaearon/redux/tree/v1.0.0-rc), but it's pretty simple to migrate this code to [Redux@v0.12.0](https://github.com/gaearon/redux/tree/v0.12.0)

###Example
rest.js
```js
import "whatwg-fetch";
import reduxApi, {transformers} from "./utils/Api";
export default reduxApi({
  // simple edpoint description
  entry: `/api/v1/entry/:id`,
  // complex endpoint description
  regions: {
    url: `/api/v1/regions`,
    // reimplement default `transformers.object`
    transformer: transformers.array,
    // base endpoint options `fetch(url, options)`
    options: {
      header: {
        "Accept": "application/json"
      }
    }
  }
}, fetch); // it's nessasary to point using rest backend
```

index.jsx
```js
import React, {PropTypes} from "react";
import { createStore, applyMiddleware, combineReducers } from "redux";
import thunk from "redux-thunk";
import { Provider } from "react-redux";
import rest from "./rest"; //our redux-rest object

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const reducer = combineReducers(rest.reducers);
const store = createStoreWithMiddleware(reducer);

@connect((state)=> ({ entry: state.entry, regions: state.regions }))
class UserApp {
  static propTypes = {
    entry: PropTypes.object.isRequired,
    regions: PropTypes.array.isRequired
  }
  componentDidMount() {
    const {dispatch} = this.props;
    // fetch `/api/v1/regions
    dispatch(rest.actions.regions());
    //specify id for GET: /api/v1/entry/1
    dispatch(rest.actions.entry({id: 1})); 
  }
  render() {
    const {entry, regions} = this.props;
    const Regions = regions.data.map((item)=> <p>{ item.name }</p>)    
    return (
      <div>
        Loading regions: { regions.loading }
        <Regions/>
        Loading entry: {entry.loading}
        <div>{{ entry.data.text }}</div>
      </div>
    );
  }
}

React.render(
  <Provider store={store}>
    { ()=> <UserApp /> }
  </Provider>,
  document.getElementById("content")
);
```
