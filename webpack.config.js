const path = require('path');

const npmLibConfig = {
    entry: {
        'chart.js': './src/index.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist/'),
        filename: '[name]',
        libraryTarget: 'commonjs2',
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    'style-loader', // creates style nodes from JS strings
                    'css-loader', // translates CSS into CommonJS
                    { loader: path.resolve(__dirname, './scripts/minifycss.js') },
                    'sass-loader', // compiles Sass to CSS, using Node Sass by default,
                ],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    { loader: 'babel-loader' },
                    // { loader: path.resolve(__dirname, './scripts/minifyjs.js') },
                ],
            },
        ],
    },
};

const demoConfig = {
    entry: {
        'demo1.bundle.js': './demo/demo1.js',
        'demo2.bundle.js': './demo/demo2.js',
        'demo3.bundle.js': './demo/demo3.js',
    },
    output: {
        path: path.resolve(__dirname, 'demo/'),
        filename: '[name]',
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    'style-loader', // creates style nodes from JS strings
                    'css-loader', // translates CSS into CommonJS
                    { loader: path.resolve(__dirname, './scripts/minifycss.js') },
                    'sass-loader', // compiles Sass to CSS, using Node Sass by default,
                ],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    { loader: 'babel-loader' },
                    // { loader: path.resolve(__dirname, './scripts/minifyjs.js') },
                ],
            },
        ],
    },
};


module.exports = [npmLibConfig, demoConfig];
