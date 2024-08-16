const { validationResult } = require('express-validator');
const Employee = require('../models/employee');
const HttpError = require('../models/http-error');
const Position = require('../models/position');

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

    console.log("puesto: ",position)
    // Verificar que el puesto exista
    let existingPosition;
    try {
        existingPosition = await Position.findById(position);
        if (!existingPosition) {
            const error = new HttpError(
                'El puesto asignado no existe.',
                404
            );
            return next(error);
        }
    } catch (err) {
        const error = new HttpError(
            'No se pudo verificar el puesto.',
            500
        );
        return next(error);
    }
    
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

    const { position, name, email, page = 1, limit = 10 } = req.query;
    let query = {};

    if( position ) query.position = position;
    if( name ) query.name = new RegExp( name, 'i');
    if( email ) query.email = new RegExp( email, 'i');

    console.log("puesto",position)
    console.log("query:", query)
    let employees;
    try{
        employees = await Employee.find(query)
            .skip((page -1) * limit)
            .limit(parseInt(limit));

        const total = await Employee.countDocuments(query);

        res.json({ 
            employees: employees.map( employee =>
                 employee.toObject({ getters: true })
            ),
            totalPages: Math.ceil( total / limit ),
            currentPage: parseInt(page),
        });
    }catch(err){
        const error = new HttpError(
            'No se pudo recuperar los empleados',
            500
        )
        console.log("error:",err);
        return next(error);
    }
    
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

    // Verificar que el puesto exista
    if (position) {
        let existingPosition;
        try {
            existingPosition = await Position.findById(position);
            if (!existingPosition) {
                const error = new HttpError(
                    'El puesto asignado no existe.',
                    404
                );
                return next(error);
            }
        } catch (err) {
            const error = new HttpError(
                'No se pudo verificar el puesto.',
                500
            );
            return next(error);
        }
    }


    let employee;

    try{
       employee =  await Employee.findById(employeeId);

       if(!employee){
            return next(new HttpError(
                'Empleado no encontrado',
                404//not-found
            ));
       }

       if(name) employee.name = name;
       if(email) employee.email = email;
       if(positionId) employee.position = positionId;
       if(salary) employee.salary = salary;
       if(address) employee.address = address;


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

//eliminar un empleado
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

//mostrar detalles de un empleado
const getEmployeeById = async (req, res, next) => {
    const empId = req.params.empId;
    let employee;
    try{
        employee = await Employee.findById(empId);
        if(!employee){
            const error = new HttpError(
                'no coincide el id',
                500
            )
            return next(error);
        }
    }catch(err){
        const error = new HttpError(
            'No se encontró al empleado',
            500
        )
        console.log(err);
        return next(error);
    }
    res.json({ 
        employee: employee.toObject({ getters: true })
    });
};


exports.createEmployee = createEmployee;
exports.getEmployees = getEmployees;
exports.updateEmployee = updateEmployee;
exports.deleteEmployee = deleteEmployee;
exports.getEmployeeById = getEmployeeById;