const mongoose = require('mongoose');

const hackerSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
  },
  route: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

const Hacker = mongoose.model('Hacker', hackerSchema);

module.exports = Hacker;
 