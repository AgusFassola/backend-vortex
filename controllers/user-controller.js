const { validationResult } = require('express-validator');
const bcrypt = require('bacryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

const User = require('../models/user');

const getUsers = async (req, res, next) => {
    let users;
    try{
        users = await User.find({}, '-password');
    }catch(err){
        const error = new HttpError(
            'Error al obtener el usuario',
            500
        );
        return next(error)
    }
}

exports.getUsers = getUsers;
