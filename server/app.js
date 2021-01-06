const express = require('express');
const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const config = require('../webpack.config.js');
const app = express();
const compiler = webpack(config);
app.use(webpackDevMiddleware(compiler, {
  publicPath: '/'
}))
app.use(express.static(__dirname + '/../'));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/../public/index.html'));
});

app.listen(8080, '127.0.0.1');
