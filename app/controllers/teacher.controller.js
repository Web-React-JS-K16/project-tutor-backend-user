const Teacher = require('../models/teacher.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID


/**
 * Get info of teacher
 * body: { id}
 */
exports.getInfo = async (req, res) => {
    // const _id = req.body
    const _id = req.params.id
    console.log("id: ", req.params.id)

    try {
        const result = await Teacher.findOne({ userId: _id })
        .populate('userId', { passwordHash: 0, password: 0 })
        .populate('tags._id')   
        // console.log("id: ", result)
        if (!result) {
        return res.status(400).send({ message: 'Không tìm thấy thông tin người dùng!'});
        }

        const { city, district, salary, about, tags, jobs, hoursWorked, ratings, successRate } = result;
        const userResult = result.userId;
        return res.status(200).send({ payload: 
            {city, district, salary, about, tags, jobs, hoursWorked, ratings, successRate,
            user: userResult } });
    } catch (err){
        console.log("err: ", err);
        return res.status(500).send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!'});
    }
};

/**
 * body: {user}
 */
exports.updateInfoTeacher = async (req, res) => {
    try {
        const { user } = req;
        const { city, district, about, tags} = req.body;    
        const newTags = tags.map(item => {
            const _id = item;
            return {_id: ObjectId(_id)}
        } )
        if (user) {
            console.log("update 1 ")

            await Teacher.updateOne({ userId: user._id }, { $set: { city, district, about , tags: newTags} });
            console.log("update 2 ")

            await User.updateOne({ _id: user._id }, { $set: { ...req.body } });
            return res.status(200).send({ message: 'Cập nhật thông tin thành công.' });
        } else {
            return res.status(400).send({ message: 'Tài khoản không tồn tại.' });
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
    }
};
