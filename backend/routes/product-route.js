const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload-middleware');
const auth = require('../middleware/auth-middleware');
const isAdmin = require('../middleware/admin-middleware');
const {  uploadProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct} = require('../controllers/products-controllers')

router.post('/add',auth,isAdmin,upload, uploadProduct)
router.get('/get',getProducts)
router.get('/get/:id',getProductById);
router.put('/:id',auth,isAdmin, upload, updateProduct);
router.delete('/:id',auth,isAdmin, deleteProduct);
module.exports = router;
