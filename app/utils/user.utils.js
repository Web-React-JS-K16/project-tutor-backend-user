const jwt = require("jsonwebtoken");
const jwtSecretConfig = require("../../config/jwt-secret.config");



exports.createUserToken = (info) =>{
    const token = jwt.sign(
        { ...info },
        jwtSecretConfig.jwtSecret
    );
    return token
}