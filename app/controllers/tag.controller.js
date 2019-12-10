const Tag = require('../models/tag.model');

/**
 * body: {displayName, phone, birthdate, gender, city, district, ward }
 */
exports.getAll = async (req, res) => {
    try {
        const result = await Tag.find({});
        return res.status(200).send({ payload: result });
    } catch {
        return res.status(500).send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
    }
};
