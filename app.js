'use strict'


var express = require('express');
var bodyParser = require('body-parser');

var app = express();


var user_routes = require('./routes/user');

app.use(express.urlencoded({extended: false}));
app.use(express.json());




app.use('/api', user_routes);


module.exports = app;


