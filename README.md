### Redux-api
Flux REST API for redux infrastructure

[![Build Status](https://travis-ci.org/lexich/redux-api.svg)](https://travis-ci.org/lexich/redux-api)
[![NPM version](https://badge.fury.io/js/redux-api.svg)](http://badge.fury.io/js/redux-api)
[![Coverage Status](https://coveralls.io/repos/lexich/redux-api/badge.png?branch=master)](https://coveralls.io/r/lexich/redux-api?branch=master)

Inspired by [Redux-rest](https://github.com/Kvoti/redux-rest) and is recommended to work with [Redux](https://github.com/gaearon/redux).

## Install
with npm
```sh
npm install redux-api --save
```
with bower
```sh
bower install redux-api --save
```

=======
## Examples
[examples/isomorphic](https://github.com/lexich/redux-api/examples/isomorphic) - React + Redux + React-Router + Redux-api with webpack and express + github api

## Documentation
```js
import reduxApi, {transformers} from "redux-api";
```
#### reduxApi(options)
- @description create endpoint
- @param **options** - configuration rest-api endpoints
  > *type*: Object
  > *default*: {}
  > *example*:
  Simple endpoint definition `GET /api/v1/entry` where response is Object
    ```js
    {
      entry: "/api/v1/entry",
    }
    // equivalent
    {
      entry: {
        url: "/api/v1/entry"
      }
    }
    // equivalent
    {
      entry: {
        url: "/api/v1/entry",
        transformer: transformers.object, //it's default value
        options: {}                       //it's default value
      }
    }
    // equivalent
    {
      entry: {
        url: "/api/v1/entry",
        transformer: transformers.object, //it's default value
        options: function(url, params) {  //it's default value
          return {};
        }                       
      }
    }
    ```
- @param **options.{endpoint}.url** - endpoint for rest api
  > *type*: String
- @param  **options.{endpoint}.transformer** - response transformer
  > *type*: Function
  > *default*: transformers.object
  > *example*: It's a good idea to write custom transformer
    for example you have responce
    ```json
    { "title": "Hello", "message": "World" }
    ```
    Custom transformer
    ```js
    function customTransformer(data) {
      data || (data = {});
      return { title: (data.title || ""), message: (data.message || "")};
    }
    ```
- @param **options.{endpoint}.options** - Options for rest-api backend. `function(url, options)`
    > *type*: Object | Funtions
    > *default*: null
    > *example*: if you use [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch) backend
      ```js
      options: {
        method: "post",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      }
      // equivalent
      options: function() {
        return {
          method: "post",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        };
      }
      
      ```

#### reduxApi object
`reduxApi` initializer returns non initialized object. You need to call `init` for initilize it.
```js
import "isomorphic-fetch";
import reduxApi from "redux-api";
import adapterFetch from "redux-api/adapters/fetch";
const rest = reduxApi({
  ... //config
});
rest.init(adapterFetch(fetch), false);
```
- **reduxApi().init(adapter, isServer)**
> *type*: Function - initialize reduxApi object
> @param **adapter** - backend adapter. In curent example we use `adaptersFetch` adapter for rest backend using `fetch` API for rest [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch)
> @param **isServer** - redux api is isomorphic compatible see [examples/isomorphic](https://github.com/lexich/redux-api/examples/isomorphic) By default `isServer===false` for clien-size mode. If `isServer===true` redux-api works in server-size mode.

#### actions
```js
const rest = reduxApi({
  entries: "/api/v1/entry",
  entry: {
    url: "/api/v1/entry/:id",
    options: {
      method: "post"
    }
  }
});
....
const {actions} = rest;

/*
initialState for store
store = {
  entries: {
    loading: false, // request finish flag
    sync: false,    // data has loaded minimum once
    data: {}        // data
  },
  entry: { loading: false, sync: false, data: {} },
}
*/

// In component with redux support (see example section)
const {dispatch} = this.props;
dispatch(rest.actions.entries()); // GET "/api/v1/entry"
dispatch(rest.actions.entry({id: 1}, {
  body: JSON.stringify({ name: "Hubot", login: "hubot"
}}));  // POST "/api/v1/entry/1" with body

//also available helper methods
dispatch(rest.actions.entries.reset()) // set initialState to store
dispatch(rest.actions.entries.sync()) // this mathod save you from twice requests
                                    // flag `sync`. if `sync===true` requst
                                    // wouldnt execute.
                                    // In server-side mode calls twice
```

#### reducerName

Sometimes though, you might want named actions that go back to the same reducer. For example:
```js
import reduxApi, {transformers} from "redux-api";
const rest = reduxApi({
  getUser: {
    reducerName: "user"
    url: "/user/1", // return a user object
  }
  updateUser: {
    reducerName: "user"
    url: "/user/1/update",
    options: {
      method: "post"
    }
  }
});
const {actions} = rest;

// In component with redux support (see example section)
const {dispatch} = this.props;
dispatch(rest.actions.getUser()); // GET "/api/v1/entry"
dispatch(rest.actions.updateUser({}, {
  body: JSON.stringify({ name: "Hubot", login: "hubot"})
}));  // POST "/api/v1/entry/1" with body

```
In the above example, both getUser, and updateUser update the same user reducer as they share the same reducerName

For example used es7 javascript, [Redux@1.0.0-rc](https://github.com/gaearon/redux/tree/v1.0.0-rc), but it's pretty simple to migrate this code to [Redux@v0.12.0](https://github.com/gaearon/redux/tree/v0.12.0)

###Example
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
import { Provider } from "react-redux";
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
    error: null,    // responce error
    data: []        // responce data
  }
}
```

### Url schema
/api/v1/user/:id
```js
rest.actions.user({id: 1}) // /api/v1/user/1
```

/api/v1/user/(:id)
```js
rest.actions.user({id: 1}) // /api/v1/user/1
```

/api/v1/user/(:id)
```js
rest.actions.user({id: 1, test: 2}) // /api/v1/user/1?test=2
```

### [Releases Changelog](https://github.com/lexich/redux-api/releases)
