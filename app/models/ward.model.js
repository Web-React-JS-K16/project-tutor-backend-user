const mongoose = require('mongoose');

const WardSchema = mongoose.Schema(
  {
    name: String,
    districtId: {
      type: Array,
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Ward', WardSchema);
