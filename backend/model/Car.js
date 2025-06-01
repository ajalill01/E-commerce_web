// backend/model/Car.js
const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., Golf 7
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }, // relation
  year: Number,
  imageUrl: String,         
  imagePublicId: String
});

module.exports = mongoose.model('Car', carSchema);
