const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/user-controller');

const router = express.Router();

//obtener todos los usuarios(solo admin)
router.get('/', userController.getUsers);

//registrar un nuevo usuario(solo admin)
router.post(
    '/signup',
    [
        check('username').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 3 })
    ],
    userController.signup
);

//para iniciar sesion
router.post('/login', userController.login);

//cambiar contraseña
router.post('/change-password', userController.changePassword );

//Nueva contraseña
router.post('/new-password/:token', userController.newPassword );


module.exports = router;
