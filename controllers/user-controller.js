const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');
const transport = require('../helpers/mailer');

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
const createUser = async (req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){ //hay errores
        const error = new HttpError(
            'Datos ingresados incorrectos',
            422//errores de semántica
        )
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

    //encriptar la contraseña antes de guardarla
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
        role//por defecto es user
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

    //201 solicitud con exito
    res.status(201).json({
        userId:createdUser.id,
        email: createdUser.email
    });
};

//actualizar usuario
const updateUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new HttpError(
            'Datos ingresados incorrectos',
             422
        );
        return next(error);
    }

    const { username, email, role } = req.body;
    const userId = req.params.userId;

    let existingUser;
    try {
        existingUser = await User.findById(userId);
        if (!existingUser) {
            const error = new HttpError(
                'Usuario no encontrado',
                 404
            );
            return next(error);
        }

        //para actualizar unicamente los campos modificados
        if(username) existingUser.username = username;
        if(email) existingUser.email = email;
        if(role) existingUser.role = role;

        await existingUser.save();
    } catch (err) {
        const error = new HttpError(
            'Error al actualizar el usuario.',
            500
        );
        return next(error);    }

    res.status(200).json({ 
        user: existingUser.toObject({ getters: true }) 
    });
};

//eliminar usuario
const deleteUser = async (req, res, next) => {
    const userId = req.params.userId;

    let existingUser;

    try{
        existingUser = await User.findById(userId);
        if(!existingUser){
            return next(new HttpError(
                'Usuario no encontrado',
                404//not-found
            ));
        }
        await existingUser.deleteOne();
    }catch(err){
        const error = new HttpError(
            'Error al eliminar el usuario',
            500
        )
        console.log(err);
        return next(error);
    }
    //200 solicitud con exito
    res.status(200).json({ message: 'Usuario eliminado' });
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

const changePassword = async (req, res, next) => {
    const { email } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError(
            'No se encontró el correo', 
            500
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
        existingUser.passwordToken = token;
        await existingUser.save();

    } catch (err) {
        const error = new HttpError(
            'Error en la autenticación',
             500
        );
        return next(error);
    }

    await transport.sendMail({
            from : '"Vortex-usuarios" <agustin.fassola98@gmail.com>',
            to :'agustin.fassola98@gmail.com',
            subject : 'Recupera tu contraseña',
            text : 'Correo desde node.js '+
            `http://localhost:5000/api/users/new-password/${token}`
    });
    res.status(200).json({ 
        ok: true, message: "correo enviado con éxito!"
    }); 

};

const newPassword = async (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;

    let existingUser;
    try{
        existingUser = await User.findOne({
            passwordToken: token
        });
    } catch (err) {
        const error = new HttpError(
            'El token es inválido', 
            400
        );
        return next(error);
    }

    if(!existingUser) {
        const error = new HttpError(
            'No se encontró al usuario', 
            400);
        return next(error);
    }
    try{
        existingUser.password = await bcrypt.hash(password, 12);
        existingUser.passwordToken = null;

        await existingUser.save();

    } catch (err) {
        const error = new HttpError(
            'Error al restablecer la contraseña', 
            500
        );
        return next(error);
    }
    res.status(200).json({
        message: 'Contraseña actualizada'
    });
};


exports.getUsers = getUsers;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.login = login;
exports.changePassword = changePassword;
exports.newPassword = newPassword;
