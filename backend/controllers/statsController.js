// backend/controllers/statsController.js
const Stats = require("../model/Stats");

const getStats = async (req, res) => {
  try {
    const { date } = req.query; // Expects 'YYYY-MM-DD'

    let query = {};
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    let stats = await Stats.findOne(query);

    // Default to zero-filled stats if no records exist for the date
    if (!stats) {
      stats = { totalIncome: 0, totalSales: 0, totalExpenses: 0 };
    }

    res.status(200).json({ success: true, stats });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching stats",
    });
  }
};

module.exports = { getStats };
