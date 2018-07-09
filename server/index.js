const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const path = require('path');

const app = express();
const config = require('../webpack.config');
const compiler = webpack(config);
const port = 3000;

app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath
}));

app.listen(port, () => {
    console.log(`Server listening on :${port}`);
});
