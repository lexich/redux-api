### Redux-api
Flux REST API for redux infrastructure

[![Build Status](https://travis-ci.org/lexich/redux-api.svg)](https://travis-ci.org/lexich/redux-api)
[![NPM version](https://badge.fury.io/js/redux-api.svg)](http://badge.fury.io/js/redux-api)
[![Coverage Status](https://coveralls.io/repos/lexich/redux-api/badge.png?branch=master)](https://coveralls.io/r/lexich/redux-api?branch=master)

## Introduction :lipstick:
Because of X `redux-api` tries to solve problem Y by doing Z. 

Inspired by [Redux-rest](https://github.com/Kvoti/redux-rest) and is intended to be used with [Redux](https://github.com/gaearon/redux).

=======
## Install
with npm
```sh
npm install redux-api --save
```
with bower
```sh
bower install redux-api --save
```

## Documentation
See [DOCS.md](DOCS.md) for API documentation.

=======
## Examples
[examples/isomorphic](https://github.com/lexich/redux-api/tree/master/examples/isomorphic) - React + Redux + React-Router + Redux-api with webpack and express + github api

### Full example Example
rest.js
```js
import "isomorphic-fetch";
import reduxApi, {transformers} from "redux-api";
import adapterFetch from "redux-api/adapters/fetch";
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
}).init(adapterFetch(fetch)); // it's nessasary to point using rest backend
```

index.jsx
```js
import React, {PropTypes} from "react";
import { createStore, applyMiddleware, combineReducers } from "redux";
import thunk from "redux-thunk";
import { Provider, connect } from "react-redux";
import rest from "./rest"; //our redux-rest object

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const reducer = combineReducers(rest.reducers);
const store = createStoreWithMiddleware(reducer);

@connect((state)=> ({ entry: state.entry, regions: state.regions }))
class Application {
  static propTypes = {
    entry: PropTypes.object.isRequired,
    regions: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired
  }
  componentDidMount() {
    const {dispatch} = this.props;
    // fetch `/api/v1/regions
    dispatch(rest.actions.regions.sync());
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
    { ()=> <Application /> }
  </Provider>,
  document.getElementById("content")
);
```

### Store state schema
```js
const rest = reduxApi({
  user: "/user/1"
});
```

```js
// initialState
{
  user: {
    sync: false,    // State was update once
    syncing: false, // State syncing is in progress
    loading: false, // State updating is in progress
    error: null,    // response error
    data: []        // response data
  }
}
```



### [Releases Changelog](https://github.com/lexich/redux-api/releases)
