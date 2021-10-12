'use strict'

var express = require('express');
var UserController = require('../controllers/user');

var api = express.Router();

api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);

module.exports = api;