### Signing request with JWT token
```js
// rest.js
reduxApi({
  user: {
    url: "/api/check_auth",
    transformer(data) {
      if (data) {
        const { token, firstname, lastname } = data;
        return { auth: true, token, firstname, lastname };
      }
      return { auth: false, token: "", firstname: "", lastname: "" };
    }
  },
  information: {
    url: "/api/information",

    // Prevent Unauthorized request
    prefetch: [
      // Step1
      function ({actions, dispatch}, cb) {
        // At first check auth state of user
        dispatch(actions.user.sync(cb));
      },
      // Step2
      function ({getState}, cb) {
        // If Step1 finished successuly check auth state
        const { user: { data: { auth }}} = getState();
        // if user authorized allow this query
        auth ? cb() : cb(new Error("Unauthorized"));
      }
    ]
  }
}).use("options", (url, params, getState)=> {
  const { user: { data: { token }}} = getState();
  // Add token to header request
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) {
    return { headers: {  ...headers, Authorization: `Bearer ${token}` } };
  }
  return { headers };
});
```
