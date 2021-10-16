'use strict'

var mongoosePaginate = require('mongoose-pagination');
var moment = require('moment');
var User = require('../models/User');
var Expense = require('../models/Expense');

function saveExpense(req, res){
    var params = req.body;

    if(!params.amount) return res.status(200).send({message: 'No hay importe en el ingreso'});

    var expense = new Expense();
    expense.name = params.name;
    expense.description = params.description;
    expense.amount = params.amount;
    expense.user = req.user.sub;
    expense.created_at = moment().unix();

    expense.save((err, expenseStored) =>{
        if(err) return res.status(500).send({ message: 'Error al guardar la publicación'});
    
        if(!expenseStored) return res.status(500).send({ message: 'El gasto no se ha podido guardar'});

        return res.status(200).send({ expenseStored });
    });

}

function getExpense(req, res) {
    var expenseId = req.params.id;

    Expense.findById(expenseId, (err, expense) => {
        if (err) return res.status(500).send({ message: ' Error en la petición' });

        if (!expense) return res.status(404).send({ message: 'El gasto no existe' });

        return res.status(200).send({ expense });
    });
}

function getExpenses(req, res){
    var page = 1;
    if(req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 5;

    Expense.find().sort('_id').paginate(page, itemsPerPage, (err, expenses, total) =>{
        Expense.populate(expenses, {path: "user", select: ['-password', '-role']}, function(err, expenses){
            if (err) return res.status(500).send({ message: ' Error en la petición' });

            if (!expenses) return res.status(404).send({ message: 'No se han encontrado gastos' });

            return res.status(200).send({ expenses, total, pages: Math.ceil(total / itemsPerPage) });
        });
    });
}

function updateExpense(req, res) {
    var expenseId = req.params.id;
    var update = req.body;

    /*delete update.password;*/

    /*if (userId != req.user.sub) {
        return res.status(500).send({ message: 'No tienes permiso para actualizado los datos de ese usuario' });
    }*/

    Expense.findByIdAndUpdate(expenseId, update, { new: true }, (err, expenseUpdated) => {
        if (err) return res.status(500).send({ message: ' Error en la petición' });

        if (!expenseUpdated) return res.status(404).send({ message: 'El gasto no existes' });

        return res.status(200).send({ expenseUpdated });
    });
}

function deleteExpense(req, res){
    var expenseId = req.params.id;

    Expense.findByIdAndRemove(expenseId, (err, expenseRemoved) =>{

        if(err) return res.status(500).send({message: 'No se ha podido eliminar el gasto'});
        

        if(!expenseRemoved) return res.status(404).send({message: 'El gasto no existe'});
        

        return res.status(200).send({
            message: 'Gasto eliminado'
        });
    });
}


module.exports = {
    saveExpense,
    getExpenses,
    getExpense,
    deleteExpense,
    updateExpense
}
