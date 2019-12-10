// const Student = require('../models/student.model');
// const User = require('../models/user.model');

// /**
//  * body: {displayName, phone, birthdate, gender, city, district, ward }
//  */
// exports.updateInfo = async (req, res) => {
//     const { avatar } = req.body;
//     const { user } = req;
//     try {
//         // console.log("user: ", user);
//         if (user) {
//             const result = await User.updateOne({ _id: user._id }, { $set: { avatar } });
//             // console.log("user rs: ", result);
//             return res.status(200).send({ message: 'Cập nhật ảnh đại diện thành công.' });

//         } else {
//             return res.status(400).send({ message: 'Tài khoản không tồn tại.' });
//         }
//     } catch {
//         return res
//             .status(500)
//             .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
//     }
// };

// /**
//  * body: {token}
//  */
