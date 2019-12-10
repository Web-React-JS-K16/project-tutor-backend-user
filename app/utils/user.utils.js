const jwt = require("jsonwebtoken");
const jwtSecretConfig = require("../../config/jwt-secret.config");
const constant = require("../../config/constant");

exports.createUserToken = (info) =>{
    const token = jwt.sign(
        { ...info },
        jwtSecretConfig.jwtSecret
    );
    return token
}
//=============
exports.createActiveEmailTokenWithId = userId =>{
    const token = jwt.sign( { userId },
        jwtSecretConfig.jwtSecretForActiveEmail,
        { expiresIn: "2 days" });
    return token;
}

exports.decodeActiveEmailToken = async (token) => {
    try {
    const result = await jwt.verify(token, jwtSecretConfig.jwtSecretForActiveEmail)
    // console.log("result: ", result);
    return result;
    } catch {
        return null;
    }
}
//=============
//=============
exports.createResetPasswordTokenWithId = async userId => {
    const token = await jwt.sign({ userId },
        jwtSecretConfig.jwtSecretForResetPassword,
        { expiresIn: "2 days" });
    return token;
}

exports.decodeResetPasswordToken = async token => {
    try {
        const result =await jwt.verify(token, jwtSecretConfig.jwtSecretForResetPassword)
        return result;
    } catch {
        return null;
    }
}

//=============
exports.checkRole = (role) => (req, res, next) =>{
    console.log("role: ", role, " ==", req.user.typeID)
    if (!req.user || req.user.typeID !== role){
        return res.redirect(`${constant.frontendUrl}/student/login`)
    }

    return next();
}