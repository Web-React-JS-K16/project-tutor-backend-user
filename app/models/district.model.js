const mongoose = require('mongoose');

const DistrictSchema = mongoose.Schema(
  {
    name: String,
    cityId: {
      type: Array,
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('District', DistrictSchema);
