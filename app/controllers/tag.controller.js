const Tag = require('../models/tag.model');

exports.getAll = async (req, res) => {
  try {
    const result = await Tag.find({});
    return res.status(200).send({ payload: result });
  } catch (err) {
    console.log('error: ', err.message);
    return res
      .status(500)
      .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
  }
};
