'use strict'

var bcrypt = require('bcrypt-nodejs');
const { find } = require('../models/User');
var User = require('../models/User');

function saveUser(req, res) {
    var params = req.body;
    var user = new User();

    if (params.name && params.surname && params.email && params.password) {
        user.name = params.name;
        user.surname = params.surname;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        User.find({ email: user.email.toLowerCase() }).exec((err, users) => {
            if (err) return res.status(500).send({ message: 'Error en la petición de usuarios' });

            if (users && users.length >= 1) {
                return res.status(200).send({
                    message: 'El email ya está en uso'
                });
            } else {
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash;

                    user.save((err, userStored) => {
                        if (err) return res.status(500).send({ message: 'Error al guardar el usuario' });

                        if (!userStored) {
                            return res.status(404).send({
                                message: 'Oops, algo ha fallado y no se ha podido crear el usuario'
                            });
                        }
                        return res.status(200).send({
                            message: 'Usuario creado correctamente',
                            user: userStored
                        })
                    });
                });
            }
        });



    } else {
        res.status(200).send({
            message: 'Faltan campos por rellenar'
        });
    }

}


function loginUser(req, res){
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({email: email}, (err, user) =>{
        if(err) return res.status(500).send({message: 'Error en la petición'});

        if(user){
            bcrypt.compare(password, user.password, (err, check) =>{
                if(check){
                    user.password = undefined;
                    return res.status(200).send({user});
                }else{
                    return res.status(404).send({message: 'El usuario no se ha podido identificar'});
                }
            })
        }else{
            return res.status(404).send({message: 'El usuario no se ha podido identificar!'});
        }
    })
}


module.exports = {
    saveUser,
    loginUser
}