const jwt = require("jsonwebtoken");
const jwtSecretConfig = require("../../config/jwt-secret.config");


exports.createUserToken = (info) =>{
    const token = jwt.sign(
        { ...info },
        jwtSecretConfig.jwtSecret
    );
    return token
}
//=============
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
//=============
//=============
exports.createResetPasswordTokenWithId = (userId => {
    const token = jwt.sign({ userId },
        jwtSecretConfig.jwtSecretForResetPassword,
        { expiresIn: "2 days" });
    return token;
})

exports.decodeResetPasswordToken = (token => {
    const result = jwt.verify(token, jwtSecretConfig.jwtSecretForResetPassword)
    return result;
})

//=============