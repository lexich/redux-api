## Documentation
### Initialization redux-api endpoint

```js
import reduxApi, {transformers} from "redux-api";
```

#### reduxApi(options, baseConfig)
- **Description**: create endpoint
- **Param** **options** - configuration of rest-api endpoints
  - **Type**: Object
  - **Default**: {}
  - **Example**:
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
        options: function(url, params, getState) {  //it's default value
          return {};
        }
      }
    }
```
**Param** **baseConfig** - additional base configuration
**Param** baseConfig.prefix - custom prefix for ACTIONS if you use more then 1 restApi instance
**Type**: String
**Default**: ""


### Configuration options
#### url
- **Description**: url endpoint
- **Type**: String
- **Example**:
```js
{
  entry: {
    url: "/api/v1/entry"
  }
}
```

#### urlOptions
- **Description**: options for transforming urls
- **Type**: Object
- **Example**: Keys `delimiter` and `arrayFormat` are passed on to
  [qs#parse](https://github.com/ljharb/qs#parsing-objects) and
  [qs#stringify](https://github.com/ljharb/qs#stringifying):
```js
{
  entry: {
    url: "/api/v1/entry",
    urlOptions: {
      delimiter: ";",
      arrayFormat: "brackets"
    }
  }
}
```
  To pass different options to `#parse` and `#stringify`, use the `qsParseOptions` and `qsStringifyOptions` keys:
```js
{
  entry: {
    url: "/api/v1/entry?a[]=5,a[]=6",
    urlOptions: {
      arrayFormat: "brackets",
      qsParseOptions: {
        delimiter: /[,;]/
      },
      qsStringifyOptions: {
        delimiter: ";"
      }
    }
  }
}
```
  This would re-encode the url to `/api/v1/entry?a[]=5;a[]=6`.

#### transformer
- **Description**: function for rest response transformation
- **Type**: Function
- **Default**: transformers.object
- **Example**: It's a good idea to write custom transformer
    for example you have response
```json
  { "title": "Hello", "message": "World" }
```
    Custom transformer
```js
  function customTransformer(data, prevData, action) {
    data || (data = {});
    return { title: (data.title || ""), message: (data.message || "")};
  }
```

#### options
- **Description**: options for rest-api backend. `function(url, options)`
- **Type**: Object | Functions
- **Default**: null
- **Example**: if you use [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch) backend
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

#### cache
- **Description**: cache response. By default cache is turn off. If cache = true - this means that cache is permanent. Also cache can be object. see example
- **Type** Boolean, Object, null
- **Default**: null
- **Example**:
```js
{
  permanent: {
    url: "/api/v1/permanent",
    cache: true
  },
  expires1: {
    url: "/api/v1/expires/1",
    cache: { expire: 360 }, // 360 seconds
  },
  expires2: {
    url: "/api/v1/expires/2",
    cache: {
      expire: new Date("...."), // use concrete Date
      id(params, params) {
        // here you can overwrite cache id for request
        return `you custom id for request`;
      }
    }
  }
}
```

#### broadcast
- @deprecated
- **Description**: list of actions which would emit after data fetching.
- **Type**: Array
- **Default**: null
- **Example**:
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

#### reducer
- **Description**: Define your custom reducer to catch other events and modify state of current entry
ATTENTION: custom reducer can't catch default events for current entry.
- **Type**: Function
- **Default**: null
- **Example**:
```js
const rest = reduxApi({
  hello: "/api/hello",
  item: {
    url: "/api/item",
    reducer(state, action) {
      /*
      ATTENTION: this.events.item.actionSuccess and other default redux-api events never catch there
      */
      // context has instance
      if (action.type === "MY_CUSTOM_EVENT") {
        return { ...state, value: action.value };
      } else if (action.type === this.events.hello.actionSuccess) {
        return { ...state, value: action.value };
      } else {
        return state;
      }
    }
  }
});
```

#### virtual
- **Description**: if virtual is `true` this endpoint doesn't create reducer and doesn't emit redux-api actions. All data broadcasting by actions from `broadcast` list.
- **Type**: Array
- **Default**: false
- **Example**:
It usefull, for example, when you need to manipulate list of items. But you don't want to persist information about each manipulation, you want to save it in list.
```js
const rest = reduxApi({
  items: "/api/items",
  item: {
    url: "/api/item/:id",
    virtual: true, //reducer in this case doesn't generate
    postfetch: [
      function({ dispatch, actions }) {
        dispatch(actions.items()); // update list of items after modify any item
      }
    ]
  }
});
```
In this case you global state is look like this:
```js
{ items: [ ... ] }
```

#### prefetch
- **Description**: you can organize chain of calling events before the current endpoint will be executed
- **Type**: Array<Function>
- **Default**: null
- **Example**:

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
      const {profile: {data: {uuid}}} = getState();
      return { ...params, body: { ...params.body, uuid }};
    }
  },
  friends: {
    url: "/user/:name/friends",
    prefetch: [
      function({actions, dispatch, getState, requestOptions}, cb) {
        const {profile: {data: {uuid}}} = getState();
        const {pathvars: {name}} = requestOptions;
        uuid ? cb() : dispatch(actions.profile({name}, cb));
      }
    ],
    options: function(url, params, getState) {
      const {profile: {data: {uuid}}} = getState();
      return { ...params, body: { ...params.body, uuid }};
    }
  }
}
```

#### postfetch
- **Description**: you can organize chain of calling events after the current endpoint will be successful executed
- **Type**: Array<Function>
- **Default**: null
- **Example**:
```js
{
  user: "/user/info",
  logout: {
    url: "/user/logout",
    postfetch: [
      function({data, actions, dispatch, getState, request}) {
        dispatch(actions.user.reset());
      }
    ]
  }
}
```

#### validation (data, callback)
- **Param** **data** - response data
  > type: Object

- **Param** **callback** - you need to execute this callback function to finish data validation
  > type: Function

- **Example**:
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
- **Description**:  Sometimes though, you might want named actions that go back to the same reducer. For example:
- **Type**: String
- **Example**:
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

#### helpers
- **Description**: you can create custom helper function which work with this rest endpoint but with different parameters.
- **Type**: Object
- **Example**:
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

#### crud
- **Description**: autogenerate `helpers` ("get", "post", "put", "delete", "patch") for selected endpoint. Also you can overwrite autogenerate action with `helpers` definitions.
- **Type**: Boolean
- **Default**: false
- **Example**:
```js
{
  test: {
    url: "/test/:id",
    crud: true
  }
}

//using
rest.actions.test.get({ id: 1})
rest.actions.test.post({ id: 1}, { body: "data" }, (err, data)=> {
  //code
});
rest.actions.test.put({ id: 1}, { body: "data" })
rest.actions.test.delete({ id: 1 });
```

### reduxApi object

#### use(key, value)
- **Description**: initialize `reduxApi` with custom properties
- **Param** **key** - name of property
- **Param** **value** - value of property

#### list of properties
#### fetch
- **Description**: backend adapter. In current example we use `adaptersFetch` adapter for rest backend using `fetch` API for rest [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch)
- **Example**:
```js
import adapterFetch from "redux-api/lib/adapters/fetch";
const rest = reduxApi({...});
rest.use("fetch", adapterFetch(fetch));
```

#### server
- **Description**: redux api is isomorphic compatible see [examples/isomorphic](https://github.com/lexich/redux-api/tree/master/examples/isomorphic) By default `server===false` for client-size mode. If `server===true` redux-api works in server-size mode.
- **Default** false
```js
const rest = reduxApi({...});
rest.use("server", true);
```

#### rootUrl
- **Description**: root url for every endpoint. very usefull for isomorphic(universal) app. For client-side use default rootUrl, and for backend use http://localhost:80 for example. For client-side for request `/api/get` will be `/api/get` and for backend will be `http://localhost:80/api/get`
- **Type**: String | Functions
- **Example**:
```js
const rest = reduxApi({...});
rest.use("rootUrl", "http://localhost:3000");
```

Or a function
```js
const rest = reduxApi({...});
rest.use("rootUrl", function(url, params, getState) {
  return getState().config.rootUrl;
});
```

#### options
- **Description**: Apply add options for each rest call.
- **Type**: String | Functions
- **Example**:
```js
const rest = reduxApi({...});
rest.use("options", function() {
  const headers = {
    'User-Agent': 'foodsoft-shop', // @todo add version
    'Accept': 'application/json'
  };
  return { headers: headers };
});
```

Or a function
```js
const rest = reduxApi({...});
rest.use("options", function(url, params getState) {
  return {
    headers: {
      'X-Token': getState().user.accessToken
    }
  };
});
```

#### middlewareParser
- **Description**: if you use middleware different from [redux-thunk](https://github.com/gaearon/redux-thunk) you can realize custom behaviour for argument parser.
- **Example**:
```js
// Custom middleware
const cutsomThunkMiddleware = ({ dispatch, getState }) => next => action => {
  if (typeof action === 'function') {
    return action({ dispatch, getState });
  }
  return next(action);
};

// middlewareParser
reduxApi({ ... }).use("middlewareParser",
  ({ dispatch, getState })=> {
    return { getState, dispatch };
  });
```

#### responseHandler
- **Description**: catch all http response from each redux-api endpoint. First argument is `Error` is response fail, second argument data from success response. It can be used for logging, error handling or data transformation.
- **Example**:
```js
reduxApi({ ... }).use("responseHandler",
  (err, data)=>
    err ? console.log("ERROR", err) : console.log("SUCCESS", data));
```
```js
reduxApi({ ... }).use("responseHandler",
  (err, data)=> {
    if (err.message === 'Not allowed') {
      throw new NotAllowedError();
    } else {
      return data;
    }
  });
```

#### init(adapter, isServer, rootUrl)
- @deprecated
- **Description**: `reduxApi` initializer returns not initialized object. You need to call `init` for initialize it.
- **Type**: Function
- **Param** **adapter** - backend adapter. In current example we use `adaptersFetch` adapter for rest backend using `fetch` API for rest [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch)
- **Param** **isServer** - redux api is isomorphic compatible see   [examples/isomorphic](https://github.com/lexich/redux-api/tree/master/examples/isomorphic) By default `isServer===false` for client-size mode. If `isServer===true` redux-api works in server-size mode.
- **Param** **rootUrl** - root url for every endpoint. very usefull for isomorphic(universal) app. For client-side use default rootUrl, and for backend use http://localhost:80 for example. For client-side for request `/api/get` will be `/api/get` and for backend will be `http://localhost:80/api/get`.
- **Example**:

```js
import "isomorphic-fetch";
import reduxApi from "redux-api";
import adapterFetch from "redux-api/lib/adapters/fetch";
const rest = reduxApi({
  ... //config
});
rest.init(adapterFetch(fetch), false, "http://localhost:3000");
```

#### actions
- **Description**: list of redux actions for rest manipulations
- **Type**: Object
- **Example**:
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

### Actions sub methods

#### sync(urlparams, params, callback)
- **Description**: this method save you from twice requests flag `sync`. if `sync === true` request wouldn't execute. In server-side mode calls twice
- **Param** **urlparams**  - update url according Url schema
- **Param** **params**     - add additional params to rest request
- **Param** **callback**   - callback function when action ends
- **Type**: Function
- **Example**:

```js
import {actions} from "./rest";
function onEnter(state, replaceState, callback) {
  dispatch(rest.actions.entries.sync(callback));
}

```

### abort()
- **Description**: abort loading request
- **Type**: null
- **Example**:
```js
import {actions} from "./rest";
dispatch(actions.entries({ id: 1 }))
actions.entries.abort() // abort previous request
dispatch(actions.entries({ id: 2 }))
```

### force(urlparams, params, callback)
- **Description**: abort previous request if it performs and after that perform new request. This method combines `abort` and direct call action methods.
- **Type**: Function
- **Example**:
```
import {actions} from "./rest";
dispatch(actions.entries({ id: 1 }))
dispatch(actions.entries.force({ id: 2 }))
```

#### reset(mutation)
- **Description**: Reset state of current reducer and application abort request if it processed.
- **Type**: Function
- **Param** mutation: if `mutation` equal `sync`, it reset only `sync` flag in store.
- **Example**:
```js
import {actions} from "./rest";
function onLeave(state, replaceState, cb) {
  dispatch(actions.entries.reset(cb));
}

```

#### request()
- **Description**: Pure xhr request is without sending events or catching reducers.
- **Type**: Function
- **Example**:
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

### Events
Each endpoint in redux-api infrastructure has own collection of methods.
- actionFetch   - emits when endpoint's call is started
- actionSuccess - emits when endpoint's call finishes with success result
- actionFail    - emits when endpoint's call finishes with error result
- actionReset   - emits when reset action was called

you can get access for anyone using next accessible properties
```js
rest.events.user.actionFetch // actionSuccess actionFail actionReset
....
```
It's very useful when you need to update external reducer using information from redux-api.

```js
const initialState = { access: false };
function accessReducer(state=initialState, action) {
  switch (action.type) {
    case UPDATE_ACCESS:  // manual update
      return { ...state, access: action.access };
    case rest.events.user.actionSuccess: // user has own information about access
      return { ...state, access: action.data.access };
    default:
      state;
  }
}
```

### Tools
#### async
- **Description**: helps to organize chain call of actions
- **Example**:
```js
import reduxApi, { async } from "redux-api";
const rest = reduxApi({
  test: "/api/test",
  test2: "/api/test2",
  test3: "/api/test3"
});
async(dispatch,
  (cb)=> rest.actions.test(cb),
  rest.actions.test2
).then((data)=> async(rest.actions.test3));
```

### Store state schema
```js
import reduxApi from "redux-api";

const rest = reduxApi({
  user: "/user/1"
});
```
In the above example, an endpoint for a user object is created. The corresponding initial store state for this object is the following:

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
- The `sync` flag will be set to `true` after the first dispatched request is handled.
- The `syncing` flag is set to `true` while a dispatched sync request is being handled, but only when the `sync` flag is `false`. This can only happen once when not manually resetting the `sync` flag during execution, since the `sync` flag is set to `true` after the first dispatched request is handled.
- The `loading` flag is set to `true` while a dispatched request is being handled. After the dispatched request is handled, its value will be reset to `false`.
- The `error` property contains the response error of a dispatched request after it is handled.
- The `data` property contains the response data of a dispatched request after it is handled.
