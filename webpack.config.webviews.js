/* eslint-env node */

const path = require('path');
const webpack = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = (env, { mode }) => {
    const isDev = mode === 'development';

    return {
        target: 'web',
        mode: mode || 'none',
        entry: {
            webviews: './src/webviews/index.tsx',
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].js',
            libraryTarget: 'module'
        },
        experiments: {
            outputModule: true,
        },
        resolve: {
            roots: [__dirname],
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        optimization: {
            minimize: !isDev,
        },
        module: {
            rules: [
                {
                    test: /\.(tsx?)?$/iu,
                    use: {
                        loader: 'swc-loader',
                    },
                    exclude: /node_modules/u,
                },
                {
                    test: /\.s?css$/,
                    use: [
                        'style-loader', // Injects styles into the DOM
                        'css-loader',   // Resolves @import and url() paths
                        'sass-loader'   // Compiles Sass to CS
                    ],
                }
            ],
        },
        devServer: {
            static: {
                directory: path.join(__dirname, 'webviews/static'),
                publicPath: '/static',
            },
            allowedHosts: 'all',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
                'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
            },
            hot: true,
            client: {
                overlay: true,
                // from other source: warnings: false, // Workaround for: "Module not found: Error: Can't resolve 'applicationinsights-native-metrics' in '.../node_modules/applicationinsights/out/AutoCollection'"
            },
            //compress: true,
            port: 18088,
            devMiddleware: {
                writeToDisk: true
            },
        },
        plugins: [
            new webpack.ProvidePlugin({
                React: 'react',
            }),
            isDev && new ReactRefreshWebpackPlugin(),
        ], //.filter(Boolean),
        devtool: isDev ? 'source-map' : false, //https://webpack.js.org/configuration/devtool/
        infrastructureLogging: {
            level: 'log', // enables logging required for problem matchers
        },

        stats: {
            all: false,
            assets: true,
            builtAt: true,
            errors: true,
            performance: true,
            timings: true,
        }
    };
};
