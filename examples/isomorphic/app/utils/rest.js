/* eslint import/no-unresolved: 0 */
import reduxApi from "redux-api";
import map from "lodash/map";

const headers = {
  "User-Agent": "redux-api"
};
const URL = "https://api.github.com";

export default reduxApi({
  userRepos: {
    url: `${URL}/users/:user/repos`,
    options: { headers },
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
    url: `${URL}/repos/:user/:repo`,
    options: { headers }
  }
});
