import { resolve as _resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default {
  entry: {
    background: "./background.js",
    content: "./content.js",
    popup: "./popup.js",
  },
  output: {
    filename: "[name].bundle.js",
    path: _resolve(__dirname, "dist"),
    // Clean the output directory before emit
    clean: true,
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
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: "asset/resource",
        generator: {
          filename: "images/[name][ext][query]",
        },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  devtool: "source-map",
  mode: "production",
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
  performance: {
    // Disable performance hints for production build
    hints: false,
  },
};
