const mongoose = require('mongoose');

const DistrictSchema = mongoose.Schema(
  {
    name: String,
    cityIds: {
      type: Array,
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('District', DistrictSchema);
