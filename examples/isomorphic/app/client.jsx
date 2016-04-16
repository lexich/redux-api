"use strict";
import React from "react";
import { render } from "react-dom";

// React-Router
import Router from "react-router";
import {createHistory} from "history";
import routes from "./routes/routes";

// Redux
import { createStore, applyMiddleware, combineReducers, compose } from "redux";
import thunk from "redux-thunk";
import { Provider } from "react-redux";

// Redux-api
import reduxApi from "./utils/rest";
import adapterFetch from "redux-api/lib/adapters/fetch";
import "isomorphic-fetch";

// Initialize react-api
reduxApi.use("fetch", adapterFetch(fetch));

// Prepare store
const reducer = combineReducers(reduxApi.reducers);
const finalCreateStore = applyMiddleware(thunk)(createStore);
const initialState = window.$REDUX_STATE;
const store = initialState ? finalCreateStore(reducer, initialState) : finalCreateStore(reducer);
delete window.$REDUX_STATE;

const childRoutes = routes(store);
const history = createHistory();
const el = document.getElementById("react-main-mount");

render(
  <Provider store={store}>
    <Router key="ta-app" history={history} children={childRoutes}/>
  </Provider>,
  el
);

