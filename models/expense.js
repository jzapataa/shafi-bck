'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ExpenseSchema = Schema({
    name: String,
    description: String,
    amount: Number,
    created_at: String,
    user: {type: Schema.ObjectId, ref: 'User'},
});

module.exports = mongoose.model('Expense', ExpenseSchema);