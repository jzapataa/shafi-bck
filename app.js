'use strict'


var express = require('express');
var bodyParser = require('body-parser');

var app = express();

var user_routes = require('./routes/user');
var expense_routes = require('./routes/expense');

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
 
    next();
});

app.use('/api', user_routes);
app.use('/api', expense_routes);


module.exports = app;


