const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/user-controller');

const router = express.Router();

//obtener todos los usuarios(solo admin)
router.get('/', userController.getUsers);

//registrar un nuevo usuario(solo admin)
router.post(
    '/singup',
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 4 })
    ],
    userController.signup
);

//para iniciar sesion
router.post('/login', userController.login);

module.exports = router;
