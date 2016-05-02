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
  function customTransformer(data, prevData, action) {
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
- @deprecated
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

####reducer
```js
const rest = reduxApi({
  hello: "/api/hello",
  item: {
    url: "/api/item",
    reducer(state, action) {
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

####virtual
- @description: if virtual is `true` this endpoint doesn't create reducer and doesn't emit redux-api actions. All data broadcasting by actions from `broadcast` list.
- @type: Array
- @default: false
- @example
It usefull, for example, when you need to manipulate list of items. But you don't want to persist infomation about each manipulation, you want to save it in list.
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

####postfetch
- @description: you can organize chain of calling events after the current endpoint will be successful executed
- @type: Array<Function>
- @default: null
- @example:
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

####crud
- @description: autogenerate `helpers` ("get", "post", "put", "delete", "patch") for selected endpoint. Also you can overwrite autogenerate action with `helpers` definitions.
- @type: Boolean
- @default: false
- @example:
```js
{
  test: {
    url: "/test/:id",
    crud: true
  }
}

//using
rest.action.test.get({ id: 1})
rest.action.test.post({ id: 1}, { body: "data" }, (err, data)=> {
  //code
});
rest.action.test.put({ id: 1}, { body: "data" })
rest.action.test.delete({ id: 1 });
```

### reduxApi object

####use(key, value)
- @description initialize `reduxApi` with custom properties
- @param **key** - name of property
- @param **value** - value of property

####list of properties
####fetch
- @description backend adapter. In curent example we use `adaptersFetch` adapter for rest backend using `fetch` API for rest [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch)
- @example
```js
import adapterFetch from "redux-api/lib/adapters/fetch";
const rest = reduxApi({...});
rest.use("fetch", adapterFetch(fetch));
```

####server
- @description - redux api is isomorphic compatible see [examples/isomorphic](https://github.com/lexich/redux-api/tree/master/examples/isomorphic) By default `server===false` for clien-size mode. If `server===true` redux-api works in server-size mode.
- @default false
```js
const rest = reduxApi({...});
rest.use("server", true);
```

####rootUrl
- @description - root url for every endpoint. very usefull for isomorphic(universal) app. For clientsize use default rootUrl, and for backend use http://localhost:80 for example. For cliendsize for request `/api/get` will be `/api/get` and for backend will be `http://localhost:80/api/get`
- @example
```js
const rest = reduxApi({...});
rest.use("rootUrl", "http://localhost:3000");
```

####options
- @description - Apply add options for each rest call.
- @example
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

####init(adapter, isServer, rootUrl)
- @deprecated
- @description: `reduxApi` initializer returns non initialized object. You need to call `init` for initilize it.
- @type: Function
- @param **adapter** - backend adapter. In curent example we use `adaptersFetch` adapter for rest backend using `fetch` API for rest [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch)
- @param **isServer** - redux api is isomorphic compatible see   [examples/isomorphic](https://github.com/lexich/redux-api/tree/master/examples/isomorphic) By default `isServer===false` for clien-size mode. If `isServer===true` redux-api works in server-size mode.
- @param **rootUrl** - root url for every endpoint. very usefull for isomorphic(universal) app. For clientsize use default rootUrl, and for backend use http://localhost:80 for example. For cliendsize for request `/api/get` will be `/api/get` and for backend will be `http://localhost:80/api/get`.
- @example:

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

#### reset(mutation)
- @description: Reset state of current reducer and application's abort request if it processed.
- @type: Function
- @param mutation: if `mutation` equal `sync`, it reset only `sync` flag in store.
- @example:
```js
import {actions} from "./rest";
function onLeave(state, replaceState, cb) {
  dispatch(rest.actions.entries.reset(cb));
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

###Events
Each endpoint in redux-api infranstucrute has own collection of methods.
- actionFetch   - emits when endpoint's call is started
- actionSuccess - emits when endpoint's call finishs with success result
- actionFail    - emits when endpoint's call finishs with error result
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

###Tools
####async
- @description - helps to organize chain call of actions
- @example
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
