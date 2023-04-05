const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    devtool: "source-map",
    resolve: {
        extensions: ["", ".tsx", ".ts", ".js"],
        alias: {
            "@": path.join(__dirname, "src"),
            "@assets": path.resolve(__dirname, "src", "assets"),
        },
    },
    entry: path.join(__dirname, "src", "index.tsx"),
    output: {
        filename: "bundle.js",
        path: path.join(__dirname, "dist"),
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: "babel-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "",
            template: path.join(__dirname, "src", "assets", "index.html"),
        }),
    ],
};
