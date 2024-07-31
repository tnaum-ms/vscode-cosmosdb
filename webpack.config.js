/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//@ts-check

// See https://github.com/Microsoft/vscode-azuretools/wiki/webpack for guidance

'use strict';

const process = require('process');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const dev = require("@microsoft/vscode-azext-dev");

const outputPath = require('path').join(__dirname, 'out');


let DEBUG_WEBPACK = !!process.env.DEBUG_WEBPACK;

let config = dev.getDefaultWebpackConfig({
    projectRoot: __dirname,
    verbosity: DEBUG_WEBPACK ? 'debug' : 'normal',
    target: "node",
    externalNodeModules: [
        // Modules that we can't easily webpack for some reason.
        // These and their dependencies will be copied into node_modules rather than placed in the bundle
        // Keep this list small, because all the subdependencies will also be excluded
        'mongodb',
        'pg',
        'pg-structure'
    ],
    entries: {
        // Note: Each entry is a completely separate Node.js application that cannot interact with any
        // of the others, and that individually includes all dependencies necessary (i.e. common
        // dependencies will have a copy in each entry file, no sharing).

        // Create a separate module bundle for the mongo language server (doesn't share any code with extension.bundle.js)
        './mongo-languageServer.bundle': './src/mongo/languageServer.ts'
    },

    externals: {
    }, // end of externals

    loaderRules: [
    ], // end of loaderRules


    plugins: [
        // Replace vscode-languageserver/lib/files.js with a modified version that doesn't have webpack issues
        new webpack.NormalModuleReplacementPlugin(

            /[/\\]vscode-languageserver[/\\]lib[/\\]files\.js/,
            require.resolve('./build/vscode-languageserver-files-stub.js')
        )
    ]
});

if (DEBUG_WEBPACK) {
    console.log('Config:', config);
}

let configWebviews = {
    resolve: {
        extensions: ['.js', '.ts', '.tsx'] // .js is neccesary for transitive imports
    },

    mode: "development",

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'ts-loader',
                    options: { transpileOnly: true }, // 4x speed increase, but no type checks.
                }],
            },
            {
                test: /\.s?css$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            }
        ]
    },
    devtool: 'source-map', // 'inline-source-map' hits breakpoints more reliability, but inflate file size.
    output: {
        filename: '[name].js', // Default, consider omitting.
        path: outputPath,
    },

    entry: { panel: './src/vCore/views/collection/collection-widget.tsx' },

    devServer: {
        client: {
            overlay: {
                errors: true,
                warnings: false, // Workaround for: "Module not found: Error: Can't resolve 'applicationinsights-native-metrics' in '.../node_modules/applicationinsights/out/AutoCollection'"
            },
        },
        static: {
            directory: outputPath, // Otherwise will default to /public
        },
        port: 8000
    },

    plugins: [
        new webpack.ProvidePlugin({
            React: 'react',
        })
    ],

    stats: {
        all: false,
        assets: true,
        builtAt: true,
        errors: true,
        performance: true,
        timings: true,
    }
};

module.exports = [config];
