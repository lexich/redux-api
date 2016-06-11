import reduxApi from "../../../src/index"; //redux-api
import fetch from "../../../src/adapters/serverfetch";

export default reduxApi({
  info: {
    url: "/api/info/(:name)",
    fetch: fetch.make("info"),
    transformer(data) {
      return data || "";
    }
  }
});
