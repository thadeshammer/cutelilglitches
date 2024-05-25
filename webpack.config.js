const path = require("path");

module.exports = {
  mode: process.env.NODE_ENV || "development",
  entry: "./public/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "public"),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  resolve: {
    alias: {
      phaser: path.resolve(__dirname, "node_modules/phaser/dist/phaser.js"),
    },
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    compress: true,
    port: 3000,
    open: false, // Let's not open a browser tab
  },
};
