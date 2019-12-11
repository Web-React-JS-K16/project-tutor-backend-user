const Student = require('../models/student.model');
const User = require('../models/user.model');


/**
 * body: {token}
 */
exports.getInfoStudent = async (req, res) => {
    const { user } = req;

    try {
        if (user) {
            const studentInfo = await Student.findOne({ userId: user._id }).populate('userId', { passwordHash: 0, password: 0 });

            console.log("student: ", studentInfo);
            if (!studentInfo) {
                return res.status(400).send({ message: 'Không tìm thấy thông tin người dùng' });
            }
            const { city, district, ward } = studentInfo;
            const userResult = studentInfo.userId;

            return res.status(200).send({ payload: { city, district, ward, user: userResult } });
        } else {
            return res.status(400).send({ message: 'Tài khoản không tồn tại.' });
        }
    } catch {
        return res.status(500).send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
    }
};

/**
 * body: {user}
 */
exports.updateInfoStudent = async (req, res) => {
    const { user } = req;
    const { city, district, ward } = req.body;
    try {
        if (user) {
            await Student.updateOne({ userId: user._id }, { $set: { city, district, ward } });
            await User.updateOne({ _id: user._id }, { $set: { ...req.body } });
            return res.status(200).send({ message: 'Cấp nhật thông tin thành công.' });
        } else {
            return res.status(400).send({ message: 'Tài khoản không tồn tại.' });
        }
    } catch {
        return res
            .status(500)
            .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
    }
};