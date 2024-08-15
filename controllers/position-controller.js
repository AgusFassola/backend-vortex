const HttpError = require('../models/http-error');
const Position = require('../models/position');

//crear puestos
const createPosition = async (req, res, next) => {
    const { title } = req.body;
    const createdPosition = new Position({ title });

    try{
        await createdPosition.save();
        console.log("creado", createdPosition)
    }catch(err){
        console.log("error:",err)
        const error = new HttpError(
            'Error al crear el puesto',
            500
        )
        return next(error)
    }
    res.status(201).json({ positions: 
        createdPosition.toObject({ getters:true })
    });
};

//obtener puestos
const getPosition = async (req, res, next) => {

    let positions;
    try{
        positions = await Position.find()
    }catch(err){
        const error = new HttpError(
            'No se encontraron los puestos',
            500
        )
    }
    res.json({ positions: positions.map(
        position => position.toObject({ getters:true })
    )});
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