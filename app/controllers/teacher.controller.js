const Teacher = require('../models/teacher.model');
const User = require('../models/user.model');
var mongoose = require('mongoose');

/**
 * Get info of teacher
 * body: { id}
 */
exports.getInfo = async (req, res) => {
    // const id = req.body
    // console.log("id: ", id)

    // try {
    //     const objId = mongoose.mongo.BSONPure.ObjectID.fromHexString(id);
    //     console.log("id: ", objId)
    //     const result = await Teacher.findById(id)
    //     // .populate('userId', { passwordHash: 0, password: 0 })
    // console.log("id: ")

    //     return res.status(200).send({ payload: result });
    // } catch (err){
    //     console.log("err: ", err);
    //     return res.status(500).send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!'});
    // }
};
