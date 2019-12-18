const mongoose = require('mongoose');

const CommentSchema = mongoose.Schema(
  {
    content: String,
    date: {
      type: Date,
      default: new Date()
    },
    ratings: Number,
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Comment', CommentSchema);
