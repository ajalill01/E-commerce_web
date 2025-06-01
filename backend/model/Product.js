// backend/model/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: { type: Number, required: true, min: 0 },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car'
  },
  images: [
    {
      url: String,
      publicId: String
    }
  ]
});

module.exports = mongoose.model('Product', productSchema);
