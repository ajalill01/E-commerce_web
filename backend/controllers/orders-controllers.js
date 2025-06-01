const Product = require('../model/Product');
const Order = require('../model/Order');
const Stats = require('../model/Stats');

const createOrder = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, address, cartItems } = req.body;

    let totalPrice = 0;
    const populatedCart = await Promise.all(cartItems.map(async item => {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product with ID ${item.productId} not found`);
      
      const itemTotal = product.price * item.quantity;
      totalPrice += itemTotal;
    
      return {
        productId: product._id,
        quantity: item.quantity,
        price: product.price
      };
    }));
    
    const newOrder = new Order({
      firstName,
      lastName,
      phoneNumber,
      address,
      cartItems: populatedCart,
      totalPrice,
      status: 'pending'
    });

    await newOrder.save();
    res.status(201).json({ 
      success: true,
      message: "Order placed successfully!", 
      data: newOrder 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: "Server Error", 
      message: err.message 
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { date, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const orders = await Order.find(query)
      .populate({
        path: 'cartItems.productId',
        model: 'Product',
        select: 'name price'
      })
      .select('firstName lastName phoneNumber address cartItems totalPrice status createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total: totalOrders,
      page: parseInt(page),
      pages: Math.ceil(totalOrders / limit),
      data: orders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: err.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    console.log(`Received status update request for order ${orderId}:`, status);

    // Validate status
    const validStatuses = ['pending', 'success', 'canceled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Validate order ID format
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Additional business logic validation
    if (order.status === 'success' && status !== 'success') {
      return res.status(400).json({ 
        success: false,
        message: 'Completed orders cannot be modified' 
      });
    }

    order.status = status;
    await order.save();

    // Update stats if order is confirmed
    if (status === 'success') {
      let stats = await Stats.findOne() || new Stats();
      stats.totalSales += 1;
      stats.totalIncome += order.totalPrice;
      await stats.save();
    }

    console.log(`Successfully updated order ${orderId} to status ${status}`);
    
    res.status(200).json({ 
      success: true,
      message: 'Order status updated successfully',
      data: order 
    });
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'cartItems.productId',
        select: 'name price'
      });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Format the response
    const formattedOrder = {
      ...order._doc,
      formattedCreatedAt: new Date(order.createdAt).toLocaleString()
    };

    res.status(200).json({
      success: true,
      data: formattedOrder
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: err.message
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderDetails
};