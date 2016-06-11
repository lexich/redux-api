import Application from "./pages/Application";
import IndexPage from "./pages/IndexPage";
import rest from "./rest";
const { actions } = rest;

export default function routes({ dispatch }) {
  return {
    path: "/",
    component: Application,
    indexRoute: {
      onEnter(state, replaceState) {
        replaceState(state, "/world");
      }
    },
    childRoutes: [{
      path: "/:name",
      component: IndexPage,
      onEnter(state, replaceState, cb) {
        const { name } = state.params;
        dispatch(actions.info({ name }, null, cb));
      },
      onLeave() {
        dispatch(actions.info.reset());
      }
    }]
  }
};
