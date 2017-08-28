### Redux-api
Flux REST API for redux infrastructure

[![Build Status](https://travis-ci.org/lexich/redux-api.svg)](https://travis-ci.org/lexich/redux-api)
[![NPM version](https://badge.fury.io/js/redux-api.svg)](http://badge.fury.io/js/redux-api)
[![Coverage Status](https://coveralls.io/repos/lexich/redux-api/badge.png?branch=master)](https://coveralls.io/r/lexich/redux-api?branch=master)

## Introduction
`redux-api` solves the problem of writing clients to communicate with backends. It generates [actions](http://redux.js.org/docs/basics/Actions.html) and [reducers](http://redux.js.org/docs/basics/Reducers.html) for making AJAX calls to API endpoints. You don't need to write a lot of [boilerplate code](http://redux.js.org/docs/advanced/ExampleRedditAPI.html) if you use `redux` and wanted to exchange data with server.

Inspired by [Redux-rest](https://github.com/Kvoti/redux-rest) and is intended to be used with [Redux](https://github.com/gaearon/redux).


## Documentation
See [DOCS.md](docs/DOCS.md) for API documentation.
## Use cases
* [AuthorizationJWT.md](docs/AuthorizationJWT.md) - example of JWT Authorization  
* [Scoping.md](docs/Scoping.md) - use scoping or using multiple redux-api instance without naming intersections.

## Install
with npm
```sh
npm install redux-api --save
```
with bower
```sh
bower install redux-api --save
```

If you don't use tools like webpack, browserify, etc and loading redux-api manually - the best way add redux-api to you project is:
```js
<script src="(...)/redux-api.min.js"></script>
<script>
  window.ReduxApi = window["redux-api"];
  // or
  var ReduxApi = window["redux-api"];
  // initialization code
</script>
```

=======
## Remote calls

`redux-api` doesn't bind you to a technology to make AJAX calls. It uses configurable `adapters` - a pretty simple function which receives 2 arguments: URL of endpoint and options - and returns a Promise as result. The default adapter has an implementation like this:
```js
function adapterFetch(url, options) {
  return fetch(url, options);
}

// if you like jquery
function adapterJquery(url, options) {
  return new Promise((success, error)=> {
    $.ajax({ ...options, url, success, error });
  });
}
```
This implementation allows one to make any request and process any response.

And of course you have to set up adapter to your `redux-api` instance before using.
```
  reduxApi(....).use("fetch", adapterFetch)
```

=======
## Examples
[examples/isomorphic](https://github.com/lexich/redux-api/tree/master/examples/isomorphic) - React + Redux + React-Router + Redux-api with webpack and express + github API

### Example
rest.js
```js
import "isomorphic-fetch";
import reduxApi, {transformers} from "redux-api";
import adapterFetch from "redux-api/lib/adapters/fetch";
export default reduxApi({
  // simple endpoint description
  entry: `/api/v1/entry/:id`,
  // complex endpoint description
  regions: {
    url: `/api/v1/regions`,
    // reimplement default `transformers.object`
    transformer: transformers.array,
    // base endpoint options `fetch(url, options)`
    options: {
      headers: {
        "Accept": "application/json"
      }
    }
  }
}).use("fetch", adapterFetch(fetch)); // it's necessary to point using REST backend
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

function select(state) {
  return { entry: state.entry, regions: state.regions };
}

class Application {
  static propTypes = {
    entry: PropTypes.shape({
      loading: PropTypes.bool.isRequired,
      data: PropTypes.shape({
        text: PropTypes.string
      }).isRequired
    }).isRequired,
    regions: PropTypes.shape({
      loading: PropTypes.bool.isRequired,
      data: PropTypes.array.isRequired
    }).isRequired,
    dispatch: PropTypes.func.isRequired
  };
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

const SmartComponent = connect(select)(Application);

React.render(
  <Provider store={store}>
    <SmartComponent />
  </Provider>,
  document.getElementById("content")
);
```

### [Releases Changelog](https://github.com/lexich/redux-api/releases)
