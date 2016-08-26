"use strict";
import React from "react";
import ReactDom from "react-dom/server";
import express from "express";
import path from "path";

const PORT = 4444;

// Redux
import { applyMiddleware, createStore, combineReducers } from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";

// React-router
import {RoutingContext, match} from "react-router";
import {createMemoryHistory as createHistory} from "history";

import routes from "./routes";

// Redux-api
import "isomorphic-fetch";
import reduxApi from "./rest";
import adapterFetch from "redux-api/lib/adapters/fetch";

// json api
import api from "./api";

reduxApi
  .use("fetch", adapterFetch(fetch))
  .use("rootUrl", `http://localhost:${PORT}`)
  .use("server", true);

const history = createHistory();

// Init express app
const app = express();

// Include static assets. Not advised for production
app.use(express.static(path.join(__dirname, "..", "dist")));

// Set view path
app.set("views", path.join(__dirname, "..", "views"));

// set up ejs for templating. You can use whatever
app.set("view engine", path.join(__dirname, "..", "ejs"));

app.use(function(req, res, next) {
  if (/^\/api\//.test(req.path)) {
    return next();
  }
  const location = history.createLocation(req.url);
  const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
  const reducer = combineReducers(reduxApi.reducers);
  const store = createStoreWithMiddleware(reducer);
  const childRoutes = routes(store);
  match({ routes: childRoutes, location }, (error, redirectLocation, renderProps)=> {
    if (redirectLocation) {
      res.status(301).redirect(redirectLocation.pathname + redirectLocation.search);
    } else if (error) {
      res.status(500).send(error.message);
    } else if (renderProps === null) {
      res.status(404).render("404.ejs");
    } else {
      const html = ReactDom.renderToString(
        <Provider store={store}>
          <RoutingContext {...renderProps} />
        </Provider>
      );
      res.render("index.ejs", { html, json: JSON.stringify(store.getState()) });
    }
  });
});

app.use("/api", api);

const server = app.listen(PORT, function() {
  const {port} = server.address();
  console.log("Server started at http://localhost:%s", port);
});
