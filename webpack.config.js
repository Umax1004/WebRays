const path = require("path");
module.exports = {
    context: __dirname,
    mode: "development",
    entry: "./src/main.ts",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist"),
        publicPath: "/dist/"
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: "ts-loader"
                }
            },
            {
                test: /\.wgsl$/,
                use: {
                    loader: "ts-shader-loader"
                }
            },
            {
                test: /\.glb$/,
                type: 'asset/resource'
            }
        ]
    },
    
    resolve: {
        extensions: [".ts"]
    }
}