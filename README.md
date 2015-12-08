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
[examples/isomorphic](https://github.com/lexich/redux-api/tree/master/examples/isomorphic) - React + Redux + React-Router + Redux-api with webpack and express + github api

## Documentation
###Initialization redux-api endpoint

```js
import reduxApi, {transformers} from "redux-api";
```

#### reduxApi(options)
- @description create endpoint  
- @param **options** - configuration of rest-api endpoints  
  - @type: Object  
  - @default: {}  
  - @example:  
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

###Configuration options
#### url
- @description: url endpoint
- @type: String
- @example: 
```js
{
  entry: {
    url: "/api/v1/entry"
  }
}
```

#### transformer
- @description: function for rest response transformation
- @type: Function  
- @default: transformers.object  
- @example: It's a good idea to write custom transformer  
    for example you have response  
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

#### options
- @description: options for rest-api backend. `function(url, options)`
- @type: Object | Funtions 
- @default: null  
- @example: if you use [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch) backend  
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

####broadcast
- @description: list of actions which would emit after data fetching.
- @type: Array
- @default: null
- @example:
```js
import {ACTION_ENTRY_UPDATE} from "./constants";
....
entry: {
  url: "/api/v1/entry",
  broadcast: [ ACTION_ENTRY_UPDATE ]
}
// in your redux reducer
function (state, action) {
  switch (action.type) {
  case ACTION_ENTRY_UPDATE:
    return {
      ...state,
      data: action.data // fetching data
    };
  default:
    return state;
  }
}
```

####virtual
- @description: if virtual is `true` this endpoint doesn't create reducer and doesn't emit redux-api actions. All data broadcasting by actions from `broadcast` list.
- @type: Array
- @default: false

####prefetch
- @description: you can organize chain of calling events before the current endpoint will be executed
- @type: Array<Function>
- @default: null
- @example:

```js
{
  user: "/user/info",
  profile: "/user/:name",
  changeName: {
    url: "/user/changename",
    prefetch: [
      function({actions, dispatch, getState}, cb) {
        const {user: {data: {name}}} = getState();
        name ? cb() : dispatch(actions.user(cb));
      }, 
      function({actions, dispatch, getState}, cb) {
        const {user: {data: {name}}, profile: {data: {uuid}}} = getState();
        uuid ? cb() : dispatch(actions.profile({name}, cb));
      }
    ],
    options: function(url, params, getState) {      
      const {user: {data: {uuid}}} = getState();
      return { ...params, body: { ...params.body, uuid }};
    }
  }
}
```

####validation (data, callback)
- @param **data** - response data
  > type: Object

- @param **callback** - you need to execute this callback function to finish data validation
  > type: Function

- @example
```js
{
  test: {
    url: "/api/test",
    validation: (data, cb) {
      // check data format
      let error;
      if (data instanceOf Array) {
        error = "Data must be array";
      }
      cb(error);
    }
  }
}
```

#### reducerName
- @description:  Sometimes though, you might want named actions that go back to the same reducer. For example:
- @type: String
- @example:
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
For example used es7 javascript

####helpers
- @description: you can create custom helper function which work with this rest endpoint but with different parameters.
- @type: Object
- @example:
```js
{  
  logger: "/api/logger",
  test: {
    url: "/api/test/:name/:id",
    helpers: {
      get(id, name) {
        return [{id, name}], {}]
      },
      post(id, name, data) {
        const {uuid} = this.getState().test;
        const urlparams = {id, name};
        const params = {body: {uuid, data}};
        return [urlparams, params];
      },
      // complicated async logic
      async() {
        const {dispatch} = this;
        return (cb)=> {
          dispatch(rest.actions.logger((err)=> {
            const args = [{id: 1, name: "admin"}];
            cb(err, args);
          }));
        };
      }
    }
  }
}
// using helpers
rest.actions.test.get(1, "admin");
// with callback
rest.actions.test.post(1, "admin", {msg: "Hello"}, (err)=> {
// end of action
});
rest.actions.test.async();
```

### reduxApi object

####init(adapter, isServer, rootUrl)
- @description: `reduxApi` initializer returns non initialized object. You need to call `init` for initilize it.
- @type: Function
- @param **adapter** - backend adapter. In curent example we use `adaptersFetch` adapter for rest backend using `fetch` API for rest [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch)  
- @param **isServer** - redux api is isomorphic compatible see   [examples/isomorphic](https://github.com/lexich/redux-api/tree/master/examples/isomorphic) By default `isServer===false` for clien-size mode. If `isServer===true` redux-api works in server-size mode. 
- @param **rootUrl** - root url for every endpoint. very usefull for isomorphic(universal) app. For clientsize use default rootUrl, and for backend use http://localhost:80 for example. For cliendsize for request `/api/get` will be `/api/get` and for backend will be `http://localhost:80/api/get`.
- @example:

```js
import "isomorphic-fetch";
import reduxApi from "redux-api";
import adapterFetch from "redux-api/adapters/fetch";
const rest = reduxApi({
  ... //config
});
rest.init(adapterFetch(fetch), false, "http://localhost:3000");
```

#### actions
- @descritpion: list of redux actions for rest manipulations
- @type: Object
- @example:
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
// ....
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
dispatch(rest.actions.entries.reset()); 
dispatch(rest.actions.entries.sync());
```

###Actions sub methods

#### sync(urlparams, params, callback)
- @description: this method save you from twice requests flag `sync`. if `sync===true` requst wouldn't execute. In server-side mode calls twice
- @param **urlparams**  - update url according Url schema
- @param **params**     - add additional params to rest request
- @param **callback**   - callback function when action ends
- @type: Function
- @example:

```js
import {actions} from "./rest";
function onEnter(state, replaceState, callback) {
  dispatch(rest.actions.entries.sync(callback));  
}

```

#### reset()
- @description: Reset state of current reducer
- @type: Function
- @example:
```js
import {actions} from "./rest";
function onLeave(state, replaceState, callback) {
  dispatch(rest.actions.entries.sync(callback));  
}

```

#### request()
- @description: Pure xhr request without sending events or catching reducers.
- @type: Function
- @example:
```js
import {actions} from "./rest";
actions.entries.request().then((data)=> {
  ....
});
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
