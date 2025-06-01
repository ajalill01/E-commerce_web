const Product = require('../model/Product');
const { uploadToCloudinary } = require('../helpers/cloudinary-helpers');
const fs = require('fs');


const uploadProduct = async (req, res) => {
  try {
    const { name, description, price, carId } = req.body;


    if (!name || !price || !carId) {
      return res.status(400).json({ 
        error: 'Name, price, and car ID are required' 
      });
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ 
        error: 'Price must be a positive number' 
      });
    }

    const uploadedImages = await uploadToCloudinary(
      req.files.map(file => file.path)
    );
    req.files.forEach(file => fs.unlinkSync(file.path));

    const product = new Product({
      name,
      description,
      price: numericPrice,
      car: carId,
      images: uploadedImages.map(img => ({
        url: img.url,
        publicId: img.publicId
      }))
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);

  } catch (err) {
    console.error("Product creation error:", err);
    res.status(500).json({ 
      error: "Failed to create product",
      details: err.message 
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const { carId } = req.query;
    const filter = carId ? { car: carId } : {};
    
    const products = await Product.find(filter)
      .populate({
        path: 'car',
        populate: { path: 'brand' }
      });
      
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch products', 
      details: err.message 
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({
        path: 'car',
        populate: { path: 'brand' } // Populate brand through car
      });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ 
      error: 'Failed to fetch product',
      details: err.message 
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, carId } = req.body;
    
    let updateData = { name, description, price, car: carId };
    
    // Handle new image uploads if they exist
    if (req.files && req.files.length > 0) {
      const uploadedImages = await uploadToCloudinary(
        req.files.map(file => file.path)
      );
      req.files.forEach(file => fs.unlinkSync(file.path));
      
      updateData.images = uploadedImages.map(img => ({
        url: img.url,
        publicId: img.publicId
      }));
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('car');
    
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error("Product update error:", err);
    res.status(500).json({ 
      error: "Failed to update product",
      details: err.message 
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error("Product deletion error:", err);
    res.status(500).json({ 
      error: "Failed to delete product",
      details: err.message 
    });
  }
};

// Update your exports at the bottom
module.exports = {
  uploadProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};