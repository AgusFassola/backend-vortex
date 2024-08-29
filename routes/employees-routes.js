const express = require('express');
const { check } = require('express-validator');
const employeeController = require('../controllers/employee-controller');
const authUser = require('../middleware/auth-user');
const router = express.Router();

//obtener todos los empleados
router.get('/',employeeController.getEmployees);

//obtener templeado por id
router.get('/:empId',  employeeController.getEmployeeById);

//registrar un nuevo empleado
router.post(
    '/create',
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('position').not().isEmpty(),
        check('salary').isFloat({ gt: 0 }),//mayor que cero
        check('address').not().isEmpty()
    ],
 employeeController.createEmployee
);

//actualizar un empleado
router.patch(
    '/:empId',
    [
        check('name').optional().not().isEmpty(),
        check('email').optional().normalizeEmail().isEmail(),
        check('position').optional().not().isEmpty(),
        check('salary').optional().isFloat({ gt: 0 }),//mayor que cero
        check('address').optional().not().isEmpty()
    ],
     employeeController.updateEmployee
);

//eliminar un empleado
router.delete( '/:empId', employeeController.deleteEmployee );

module.exports = router;
