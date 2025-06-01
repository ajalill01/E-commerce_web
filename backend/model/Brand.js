// backend/model/Brand.js
const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., Volkswagen, BMW
  imageUrl: String,         
  imagePublicId: String
});

module.exports = mongoose.model('Brand', brandSchema);
