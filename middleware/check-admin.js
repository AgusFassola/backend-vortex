const HttpError = require('../models/http-error');

const checkAdmin = (req, res, next) => {
    if(req.userData.role !== 'admin'){
        const error = new HttpError(
            'Acceso denegado, no eres admin.',
            403
        );
        return next(error);
    }
    next();
};

module.exports = checkAdmin;