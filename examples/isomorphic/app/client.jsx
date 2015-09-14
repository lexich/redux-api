"use strict";
import React from "react";

// React-Router
import Router from "react-router";
import createHistory from 'history/lib/createBrowserHistory'
import routes from "./routes/routes";

// Redux
import { createStore, applyMiddleware, combineReducers, compose } from "redux";
import thunk from "redux-thunk";
import { Provider } from "react-redux";

// Redux-api
import {init as initRest, reducers} from "./utils/rest";
import adapterFetch from "../../../src/adapters/fetch";
import "isomorphic-fetch";

// Initialize react-api
initRest(adapterFetch(fetch));

// Prepare store
const reducer = combineReducers(reducers);
const finalCreateStore = applyMiddleware(thunk)(createStore);
const initialState = window.$REDUX_STATE;
const store = initialState ? finalCreateStore(reducer, initialState) : finalCreateStore(reducer);
delete window.$REDUX_STATE;

const childRoutes = routes(store);
const history = createHistory();
const el = document.getElementById("react-main-mount");

React.render(
  <Provider store={store}>
    {()=> <Router key="ta-app" history={history} children={childRoutes}/>}
  </Provider>,
  document.getElementById("react-main-mount")
);
