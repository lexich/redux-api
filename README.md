
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

=======
## Documentation

```js
import reduxApi, {transformers} from "redux-api";
```
#### reduxApi(options, fetch)
- **options** - configuration rest-api endpoints
> *type*: Object
> *return*: {reducers, actions} - `reducers` have to as parameter to `createStore` (see example section). actions (see `actions` section)
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
  ```
  **url** - endpoint for rest api
  > *type*: String 
  **transformer** - response transformer
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
      if (!data) {
        return {title: "", message: ""};
      }
      return { title: (data.title || ""), message: (data.message || "")};
    }
    ```
    **options** - Options for rest-api backend. `function(url, options)`
    > *type*: Object
    > *default*: null
    > *example*: if you use [whatwg-fetch](https://www.npmjs.com/package/whatwg-fetch) backend
      ```
      options: {
        method: "post",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
      ```

- **fetch** - rest backend. Redux-api recommends to use `fetch` API for rest [whatwg-fetch](https://www.npmjs.com/package/whatwg-fetch) 
> *type*: Function
> *default*: null

```js 
import reduxApi, {transformers} from "redux-api";
const rest = reduxApi({
  entries: "/api/v1/entry",
  entry: {
    url: "/api/v1/entry/:id",
    options: {
      method: "post"
    }
  }
});
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
  body: JSON.stringify({ name: 'Hubot', login: 'hubot' 
}}));  // POST "/api/v1/entry/1" with body

//also available helper methods
dispatch(rest.actions.entries.reset()) // set initialState to store
dispatch(rest.actions.entries.sync()) // this mathod save you from twice requests
                                    // flag `sync`. if `sync===true` requst 
                                    // wouldnt execute
```

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
