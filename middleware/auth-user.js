const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");
const User = require("../models/user");

const authUser = async (req, res, next) => {
  if (!req.headers.authorization) {
    const error = new HttpError(
      "falta el token de autenticación",
      401 //no está autorizado
    );
    return next(error);
  }

  const token = req.headers.authorization.split("")[1];
  if (!token) {
    const error = new HttpError(
      "Error al autenticar",
      401 //no está autorizado
    );
    return next(error);
  }

  let loginToken;
  try {
    loginToken = jwt.verify(token, process.env.JWT_KEY);
  } catch (err) {
    const error = new HttpError(
      "Token inválido o expirado",
      403 //no posee permisos necesarios
    );
    return next(error);
  }

  let existingUser;
  try {
    existingUser = await User.findById(loginToken.userId);
  } catch (err) {
    const error = new HttpError("falta el token de autenticación", 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "No se encontró el usuario",
      401 //no está autorizado
    );
    return next(error);
  }

  req.userData = { userId: loginToken.userId, role:existingUser.role };
  next();

};

module.exports = authUser;
