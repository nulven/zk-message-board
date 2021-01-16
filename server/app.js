const express = require('express');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const bodyParser = require('body-parser');
const url = require('url');

const { mimcHash } = require('./mimc.js');
const { verifyKey, verifySignature } = require('./verifier');
const config = require('../webpack.config.js');

const { apiRouter } = require('./routes/api');
const { router } = require('./routes');

const app = express();
const compiler = webpack(config);


if (!fs.existsSync(__dirname + '/polls')) {
  fs.mkdirSync(__dirname + '/polls');
}
if (!fs.existsSync(__dirname + '/votes')) {
  fs.mkdirSync(__dirname + '/votes');
}

app.use(webpackDevMiddleware(compiler, {
  publicPath: '/'
}))
app.use(express.static(__dirname + '/../'));

app.use('/api', apiRouter);
app.use('/', router);

var route, routes = [];
app._router.stack.forEach(function(middleware){
    if(middleware.route){ // routes registered directly on the app
        routes.push(middleware.route);
    } else if(middleware.name === 'router'){ // router middleware 
        middleware.handle.stack.forEach(function(handler){
            route = handler.route;
            route && routes.push(route);
        });
    }
});
app.listen(8080, '127.0.0.1');
