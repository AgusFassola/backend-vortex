const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/user-controller');
const authUser = require('../middleware/auth-user');
const checkAdmin = require('../middleware/check-admin');

const router = express.Router();

//obtener todos los usuarios(solo admin)
router.get(
    '/',
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
     userController.createUser
);

//actualizar usuario
router.patch(
    '/:uid',
    [
        check('username').optional().not().isEmpty(),
        check('email').optional().normalizeEmail().isEmail(),
        check('role').optional().isIn(['admin','user'])
    ],
    authUser, checkAdmin, userController.updateUser
);

//eliminar usuario
router.delete(
    '/:uid',
    authUser, checkAdmin, userController.deleteUser
);


//para iniciar sesion
router.post('/login', userController.login);

//cambiar contraseña (para usuario autenticado)
router.post('/change-password', userController.changePassword );

//Nueva contraseña - enlace de recuperación
router.post('/new-password/:token', userController.newPassword );


module.exports = router;
