const express = require('express');
const { check } = require('express-validator');
const employeeController = require('../controllers/employee-controller');

const router = express.Router();

//obtener todos los empleados
router.get('/', employeeController.getEmployees);

//registrar un nuevo empleado
router.post(
    '/',
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('position').not().isEmpty(),
        check('salary').isFloat({ gt: 0 }),
        check('address').not().isEmpty()
    ],
    employeeController.createEmployee
);

//actualizar un empleado
router.patch(
    '/:empId',
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('position').not().isEmpty(),
        check('salary').isFloat({ gt: 0 }),
        check('address').not().isEmpty()
    ],
    employeeController.updateEmployee
);

//eliminar un empleado
router.delete( '/:empId', employeeController.deleteEmployee );

module.exports = router;
