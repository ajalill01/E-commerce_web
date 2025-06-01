const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
  totalSales: { type: Number, default: 0 },    
  totalIncome: { type: Number, default: 0 },   
  totalExpenses: { type: Number, default: 0 }, 
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Stats', statsSchema);
