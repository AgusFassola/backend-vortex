const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');

//para obtener todos los usuarios(solo puede el admin)
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
    res.json({ users: users.map( user => 
        user.toObject({ getters:true})
    )});
}

//Registrar un nuevo usuario(solo puede admin)
const signup = async (req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        const error = new HttpError(
            'Datos ingresados incorrectos',
            422//errores de semántica
        )
        console.log(errors,"req.body",req.body);
        return next(error);
    }

    const { username, email, password, role } = req.body;
    let existingUser;

    try{
        existingUser = await User.findOne({ email:email });
    }catch(err){
        const error = new HttpError(
            'Falló el registro',
            500//Internal server error
        )
        console.log(err);
        return next(error);
    }

    if(existingUser){
        const error = new HttpError(
            'El usuario ya existe',
            422//errores de semántica
        )
        return next(error);
    }

    let hashedPassword;
    try{
        hashedPassword = await bcrypt.hash(password, 12);
    }catch(err){
        const error = new HttpError(
            'Error al crear el usuario',
            500//Internal server error
        )
        console.log(err);
        return next(error);
    }

    const createdUser = new User({
        username,
        email,
        password: hashedPassword,
        role//asigna el rol
    });
    try{
        await createdUser.save();
    }catch(err){
        const error = new HttpError(
            'Error al registrar el usuario',
            500//Internal server error
        )
        console.log(err);
        return next(error);
    }

    let token;
    try{
        token = jwt.sign(
            {
                userId:createdUser.id,
                email: createdUser.email
            },
            process.env.JWT_KEY,
            { expiresIn: '1h'}
        );
    }catch(err){
        const error = new HttpError(
            'Error al autenticar',
            500//Internal server error
        )
        console.log(err);
        return next(error);
    }

    //201 solicitud con exito
    res.status(201).json({
        userId:createdUser.id,
        email: createdUser.email,
        token: token
    });
};

// Iniciar sesión
const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError(
            'Error en el inicio de sesión', 
            500
        );
        return next(error);
    }

    if (!existingUser) {
        console.log("existe?",existingUser)
        const error = new HttpError(
            'Usuario incorrecto',
             403//no posee permisos
        );
        return next(error);
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt
        .compare( password, existingUser.password );
    } catch (err) {
        const error = new HttpError(
            'No se pudo verificar las credenciales', 
            500
        );
        return next(error);
    }

    if (!isValidPassword) {
        const error = new HttpError(
            'Contraseña incorrecta', 
            403
        );
        return next(error);
    }

    let token;
    try {
        token = jwt.sign(
            { 
                userId: existingUser.id, 
                email: existingUser.email 
            },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );
    } catch (err) {
        const error = new HttpError(
            'Error en la autenticación',
             500
        );
        return next(error);
    }

    res.json({ 
        userId: existingUser.id, 
        email: existingUser.email, 
        token: token 
    });
};


exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
