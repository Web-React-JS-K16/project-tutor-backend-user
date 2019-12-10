const Teacher = require('../models/teacher.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID


/**
 * Get info of teacher
 * body: { id}
 */
exports.getInfo = async (req, res) => {
    const _id = req.body
    // console.log("id: ", _id)

    try {
        const result = await Teacher.findOne({ userId: _id }).populate('userId', { passwordHash: 0, password: 0 })
        // console.log("id: ", result)
        if (!result) {
        return res.status(400).send({ message: 'Không tìm thấy thông tin người dùng!'});
        }

        const { city, district, ward } = studentInfo;
        const userResult = studentInfo.userId;


        return res.status(200).send({ payload: result });
    } catch (err){
        console.log("err: ", err);
        return res.status(500).send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!'});
    }
};
