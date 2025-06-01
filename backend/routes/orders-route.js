const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth-middleware');
const isAdmin = require('../middleware/admin-middleware');
const {
  createOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderDetails
} = require('../controllers/orders-controllers');

router.post('/add', createOrder);
router.get('/get',auth,isAdmin,  getAllOrders);
router.get('/getDetails/:id',auth,isAdmin, getOrderDetails);
router.patch('/:orderId/change',auth,isAdmin, updateOrderStatus);

module.exports = router;