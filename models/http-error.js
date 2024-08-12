class HttpError extends Error {
    constructor(message, errorCode){
        super(message); //añade una propiedad "message"
        this.code = errorCode;
    }
}

module.exports = HttpError;