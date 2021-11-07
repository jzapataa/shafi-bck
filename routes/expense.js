'use strict'

var express = require('express');
var ExpenseController = require('../controllers/expense');

var api = express.Router();
var md_auth = require('../middlewares/authenticated');

api.post('/expense', md_auth.ensureAuth, ExpenseController.saveExpense);
api.get('/expenses/:page?', md_auth.ensureAuth, ExpenseController.getExpenses);
api.get('/expenses-limit', md_auth.ensureAuth, ExpenseController.getExpensesLimit);
api.get('/expense/:id', md_auth.ensureAuth, ExpenseController.getExpense);
api.put('/expense/:id', md_auth.ensureAuth, ExpenseController.updateExpense);
api.delete('/expense/:id', md_auth.ensureAuth, ExpenseController.deleteExpense);

module.exports = api;