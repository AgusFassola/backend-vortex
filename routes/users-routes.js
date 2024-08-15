const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/user-controller');
const authUser = require('../middleware/auth-user');
const checkAdmin = require('../middleware/check-admin');

const router = express.Router();

//obtener todos los usuarios(solo admin)
router.get('/',
    authUser, checkAdmin, userController.getUsers
);

//registrar un nuevo usuario(solo admin)
router.post(
    '/create',
    [
        check('username').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 3 })
    ],
     userController.signup
);

//para iniciar sesion
router.post('/login', userController.login);

//cambiar contraseña (para usuario autenticado)
router.post('/change-password',authUser, userController.changePassword );

//Nueva contraseña - enlace de recuperación
router.post('/new-password/:token', userController.newPassword );


module.exports = router;
