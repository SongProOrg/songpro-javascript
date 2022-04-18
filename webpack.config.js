const path = require("path");

module.exports = {
  entry: "./src/SongPro.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "songpro.js",
    library: "songpro",
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    lodash: {
      commonjs: "lodash",
      commonjs2: "lodash",
      amd: "lodash",
      root: "_",
    },
  },
};
