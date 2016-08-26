/* eslint import/no-unresolved: 0 */
import reduxApi from "redux-api";
import map from "lodash/map";


const globalOptions = {
  headers: {
    "User-Agent": "redux-api"
  }
};

export default reduxApi({
  userRepos: {
    url: "/users/:user/repos",
    transformer(data) {
      return map(data, (item)=> {
        return {
          name: item.name,
          fullName: item.full_name,
          user: item.owner.login
        };
      });
    }
  },
  repo: {
    url: "/repos/:user/:repo"
  }
})
.use("rootUrl", "https://api.github.com")
.use("options", globalOptions);
