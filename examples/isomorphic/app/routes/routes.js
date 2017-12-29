import Application from "../pages/Application";
import User from "../pages/User";
import Repo from "../pages/Repo";
import rest from "../utils/rest";

const { actions } = rest;

export default function routes({ dispatch }) {
  return {
    path: "/",
    component: Application,
    indexRoute: {
      path: "/",
      onEnter(state, replaceState) {
        replaceState(state, "/lexich");
      }
    },
    childRoutes: [
      {
        path: "/:user",
        component: User,
        onEnter(state, replaceState, callback) {
          const { user } = state.params;
          dispatch(actions.userRepos({ user }, null, callback));
        }
      },
      {
        path: "/:user/:repo",
        component: Repo,
        onEnter(state, replaceState, callback) {
          const { user, repo } = state.params;
          dispatch(actions.repo({ user, repo }, null, callback));
        }
      }
    ]
  };
}
