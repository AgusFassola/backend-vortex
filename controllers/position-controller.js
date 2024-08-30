const HttpError = require('../models/http-error');
const Position = require('../models/position');

//crear puestos
const createPosition = async (req, res, next) => {
    const { title } = req.body;

    if (!title) {
        const error = new HttpError(
            'El título es requerido',
             400
        );
        return next(error);
    }
    let existingPosition;
    try {
        existingPosition = await Position.findOne({ title });
        if (existingPosition) {
            const error = new HttpError(
                'El título ya existe',
                 409
            );
            return next(error);
        }
    } catch (err) {
        return next(new HttpError(
            'Error al verificar el rol',
             500
        ));
    }

    const createdPosition = new Position({ title });
    try{
        await createdPosition.save();

        res.status(201).json({ position: 
            createdPosition.toObject({ getters:true })
        });
    }catch(err){
        const error = new HttpError(
            'Error al crear el puesto',
            500
        )
        return next(error)
    }
    
};

//obtener puestos
const getPosition = async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;

    let positions;
    try{
        positions = await Position.find()
        .skip(( page - 1) * limit)
        .limit(Number( limit ));
        const total = await Position.countDocuments();

        res.json({ positions: positions.map(
            position => position.toObject({ getters:true })
            ),
            currentPage: Number(page),
            totalPages: Math.ceil( total / limit )
        });
    }catch(err){
        const error = new HttpError(
            'No se encontraron los puestos',
            500
        )
        return next(error);
    }
    
};

//eliminar puestos
const deletePosition = async (req, res, next) => {
    const posId = req.params.posId;

    let position;
    try{
        position = await Position.findById(posId);
        if(!position){
            const error = new HttpError(
                'puesto no encontrado',
                404
            );
            return next(error);
        }

        await position.deleteOne();
    }catch(err){
        const error = new HttpError(
            'No se pudo eliminar el puesto.',
            500
        )
    }
    res.status(200).json({ message: 'Puesto eliminado' });
};

exports.createPosition = createPosition;
exports.getPosition = getPosition;
exports.deletePosition = deletePosition;