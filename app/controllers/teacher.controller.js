const Teacher = require('../models/teacher.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID


/**
 * Get info of teacher
 * body: { id}
 */
exports.getInfo = async (req, res) => {
    try {
        // const _id = req.body
        const _id = req.params.id
        console.log("id: ", req.params.id)
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
        const _cityId = city ?  ObjectId(city) : null;
        const _districtId = district ? ObjectId(district): null;

        const newTags = tags.map(item => {
            const _id = item;
            return {_id: ObjectId(_id)}
        } )
        if (user) {
            await User.updateOne({ _id: user._id }, { $set: { city: _cityId, district: _districtId, ...req.body}})
            await Teacher.updateOne({ userId: user._id },{ $set: { about , tags: newTags}});
            return res.status(200).send({ message: 'Cập nhật thông tin thành công.' });
        } else {
            return res.status(400).send({ message: 'Tài khoản không tồn tại.' });
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
    }
};
