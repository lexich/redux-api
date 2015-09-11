require("babel-core/register")({
  ignore: /node_modules/,
  loose: "all"
});

require("./app/server");
