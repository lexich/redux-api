"use strict";

/* global describe, it */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
import { expect } from "chai";
import fetch from "../src/adapters/fetch";

describe("fetch adapters", function() {
  it("check", function() {
    let jsonCall = 0;
    const fetchApi = (url, opts)=> new Promise((resolve)=> {
      expect(url).to.eql("url");
      expect(opts).to.eql("opts");
      resolve({
        status: 200,
        text() {
          jsonCall += 1;
          return Promise.resolve("{}");
        }
      });
    });
    return fetch(fetchApi)("url", "opts")
      .then(()=> {
        expect(jsonCall).to.eql(1);
      });
  });
  it("should return the error response as content", function() {
    const fetchApi = (url, opts)=> new Promise((resolve)=> {
      expect(url).to.eql("url");
      expect(opts).to.eql("opts");
      resolve({
        status: 404,
        statusText: "Not Found",
      });
    });
    return fetch(fetchApi)("url", "opts")
      .catch((error)=> {
        expect(error).to.eql({ status: 404, statusText: "Not Found" });
      });
  });
});
