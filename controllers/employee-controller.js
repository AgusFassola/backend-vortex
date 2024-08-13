const { validationResult } = require('express-validator');
const Employee = require('../models/employee');
const HttpError = require('../models/http-error');

//Agregar un empleado
const createEmployee = async(req, res, next ) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError(
            'Datos ingresados incorrectos',
             422//errores de semántica
        ));
    }

    const { name, email, position, salary, address } = req.body;

    const createdEmployee = new Employee({
        name, 
        email,
        position,
        salary,
        address
    });
    
    try{
        await createdEmployee.save();
    }catch(err){
        const error = new HttpError(
            'Error al crear el empleado',
            500
        )
        console.log(err);
        return next(error);
    }
    //201 solicitud con exito
    res.status(201).json({
        employee: createdEmployee.toObject({
            getters: true
        })
    })
};

//Obtener los empleados
const getEmployees = async (req, res, next) => {
    let employees;
    try{
        employees = await Employee.find({});
    }catch(err){
        const error = new HttpError(
            'No se pudo recuperar los empleados',
            500
        )
        console.log(err);
        return next(error);
    }
    res.json({ 
        employees: employees.map( employee =>
             employee.toObject({ getters: true })
        )
    });
};

//Actualizar datos del empleado
const updateEmployee = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError(
            'Datos ingresados incorrectos',
             422//errores de semántica
        ));
    }

    const { name, email, position, salary, address } = req.body;
    const employeeId = req.params.empId;

    let employee;

    try{
       employee =  await Employee.findById(employeeId);

       if(!employee){
            return next(new HttpError(
                'Empleado no encontrado',
                404//not-found
            ));
       }

       employee.name = name;
       employee.email = email;
       employee.position = position;
       employee.salary = salary;
       employee.address = address;


       await employee.save();
    }catch(err){
        const error = new HttpError(
            'Error al actualizar el empleado',
            500
        )
        console.log(err);
        return next(error);
    }
    //200 solicitud con exito
    res.status(200).json({
        employee: employee.toObject({
            getters: true
        })
    })
};

const deleteEmployee = async (req, res, next) => {
    const employeeId = req.params.empId;

    let employee;

    try{
        employee = await Employee.findById(employeeId);
        if(!employee){
            return next(new HttpError(
                'Empleado no encontrado',
                404//not-found
            ));
        }
        await employee.deleteOne();
    }catch(err){
        const error = new HttpError(
            'Error al eliminar el empleado',
            500
        )
        console.log(err);
        return next(error);
    }
    //200 solicitud con exito
    res.status(200).json({ message: 'Empleado eliminado' });
};

exports.createEmployee = createEmployee;
exports.getEmployees = getEmployees;
exports.updateEmployee = updateEmployee;
exports.deleteEmployee = deleteEmployee;