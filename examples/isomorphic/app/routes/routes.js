import Application from "../pages/Application";
import User from "../pages/User";
import Repo from "../pages/Repo";

import {actions} from "../utils/rest";

export default function routes({dispatch}) {
  return {
    path: "/",
    component: Application,
    childRoutes: [
      {
        path: "/:user",
        component: User,
        onEnter(state, transition, callback) {
          const {user} = state.params;
          dispatch(actions.userRepos.sync(
            { user: user || "lexich" }, null, callback)
          );
        }
      }, {
        path: "/:user/:repo",
        component: Repo,
        onEnter(state, transition, callback) {
          const {user, repo} = state.params;
          dispatch(actions.repo(
            { user: user || "lexich", repo: repo || "redux-api" },
            null, callback
          ));
        }
      }
    ]
  };
}
