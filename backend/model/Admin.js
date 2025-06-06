const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true, 
      trim: true, 
    },
    email: {
      type: String,
      required: true,
      unique: true, 
      trim: true, 
    },
    password: {
      type: String,
      required: true,
      minlength: 6, 
    },
    role: {
      type: String,
      enum: ['admin', 'superadmin'], 
      default: 'admin',  
    }
  },{timestamps : true});


module.exports = mongoose.model('Admin', adminSchema);