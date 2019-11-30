const jwt = require("jsonwebtoken");
const jwtSecretConfig = require("../../config/jwt-secret.config");


exports.createUserToken = (info) =>{
    const token = jwt.sign(
        { ...info },
        jwtSecretConfig.jwtSecret
    );
    return token
}

exports.createActiveEmailTokenWithId = (userId =>{
    const token = jwt.sign( { userId },
        jwtSecretConfig.jwtSecretForActiveEmail,
        { expiresIn: "2 days" });
    return token;
})

exports.decodeActiveEmailToken = (token => {
    const result = jwt.verify(token, jwtSecretConfig.jwtSecretForActiveEmail)
    return result;
})