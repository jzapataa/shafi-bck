'use strict'

var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');
var moment = require('moment');

var User = require('../models/User');
var jwt = require('../services/jwt');


function saveUser(req, res) {
    var params = req.body;
    var user = new User();

    if (params.name && params.surname && params.email && params.password) {
        user.name = params.name;
        user.surname = params.surname;
        user.email = params.email.toLowerCase();;
        user.role = 'ROLE_USER';
        user.image = null;
        user.created_at = moment().unix();

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


function loginUser(req, res) {
    var params = req.body;

    var email = params.email.toLowerCase();
    var password = params.password;

    User.findOne({ email: email }, (err, user) => {
        if (err) return res.status(500).send({ message: 'Error en la petición' });

        if (user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) {

                    if (params.gettoken) {
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        user.password = undefined;
                        return res.status(200).send({ user });
                    }

                } else {
                    return res.status(404).send({ message: 'El usuario no se ha podido identificar' });
                }
            });
        } else {
            return res.status(404).send({ message: 'El usuario no se ha podido identificar!' });
        }
    });
}

function getUser(req, res) {
    var userId = req.params.id;

    User.findById(userId, (err, user) => {
        if (err) return res.status(500).send({ message: ' Error en la petición' });

        if (!user) return res.status(404).send({ message: 'El usuario no existe' });

        return res.status(200).send({ user });
    });
}

function getUsers(req, res) {
    var identity_user_id = req.user.sub;

    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }

    var itemsPerPage = 5;

    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
        if (err) return res.status(500).send({ message: ' Error en la petición' });

        if (!users) return res.status(404).send({ message: 'No se han encontrado usuarios disponibles' });

        return res.status(200).send({ users, total, pages: Math.ceil(total / itemsPerPage) });
    });
}

function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    delete update.password;

    if (userId != req.user.sub) {
        return res.status(500).send({ message: 'No tienes permiso para actualizado los datos de ese usuario' });
    }

    User.find({ email: update.email.toLowerCase() }).exec((err, users) => {

        var user_isset = false; 
        users.forEach((user) =>{
            if (user && user._id != userId) user_isset = true; 
        });   

        if(user_isset) return res.status(404).send({ message: 'Ese email ya existe' });
        
        User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
            if (err) return res.status(500).send({ message: ' Error en la petición' });

            if (!userUpdated) return res.status(404).send({ message: 'El usuario no existes' });

            return res.status(200).send({ userUpdated });
        });
    });


}

function uploadImage(req, res) {
    var userId = req.params.id;

    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        console.log(file_name);
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if (userId != req.user.sub) {
            return removeFilesOfUploads(file_path, 'No tienes permiso para actualizado los datos de ese usuario');

        }

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {

            User.findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, userUpdated) => {
                if (err) return res.status(500).send({ message: ' Error en la petición' });

                if (!userUpdated) return res.status(404).send({ message: 'El usuario no existes' });

                return res.status(200).send({ userUpdated });
            });
        } else {
            return removeFilesOfUploads(file_path, 'Extensión no válida');
        }

    } else {

        return res.status(200).send({ message: 'No se han subido imágenes' });
    }

}

function getImageFile(req, res) {
    var image_file = req.params.imageFile;
    var path_file = './uploads/users/' + image_file;

    fs.exists(path_file, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'No existe la imagen' });
        }
    })
}

function removeFilesOfUploads(file_path, message) {
    fs.unlink(file_path, (err) => {
        return res.status(200).send({
            message: message
        });
    });
}


function deleteUser(req, res) {
    var userId = req.params.id;

    User.findByIdAndRemove(userId, (err, userRemoved) => {

        if (err) return res.status(500).send({ message: 'No se ha podido eliminar el usuario' });


        if (!userRemoved) return res.status(404).send({ message: 'No se encuentra ese usuario' });


        return res.status(200).send({
            message: 'Usuario eliminado'
        });
    });
}

module.exports = {
    saveUser,
    loginUser,
    getUser,
    getUsers,
    updateUser,
    uploadImage,
    getImageFile,
    deleteUser
}