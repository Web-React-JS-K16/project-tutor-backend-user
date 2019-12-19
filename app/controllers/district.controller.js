const District = require('../models/district.model');

/**
 * Get info of teacher
 * body: { id}
 */
exports.getAll = async (req, res) => {
  try {
    const result = await District.find();
    return res.status(200).send({ payload: result });
  } catch (err) {
    console.log('err: ', err);
    return res
      .status(500)
      .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
  }
};

/**
 * Get info of teacher
 * body: { cityId, name}
 */
exports.getAll = async (req, res) => {
  try {
    const result = await District.find();
    return res.status(200).send({ payload: result });
  } catch (err) {
    console.log('err: ', err);
    return res
      .status(500)
      .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
  }
};
