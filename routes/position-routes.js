const express = require('express');
const { check } = require('express-validator');
const positionController = require('../controllers/position-controller');
const authUser  = require('../middleware/auth-user');
const router = express.Router();

//obtener todos los puestos
router.get('/',authUser, positionController.getPosition );

//registrar un nuevo empleado
router.post(
    '/create',
    [
        check('title').not().isEmpty()
    ],
    authUser, positionController.createPosition );



//eliminar un puesto
router.delete( '/:posId', 
    authUser, positionController.deletePosition );

module.exports = router;
