import reduxApi from "../../../../src/index"; // redux-api
import _ from "lodash";

const headers = {
  "User-Agent": "redux-api1"
};
const URL = "https://api.github.com";

export default reduxApi({
  userRepos: {
    url: `${URL}/users/:user/repos`,
    options: { headers },
    transformer(data) {
      return _.map(data, (item)=> {
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
