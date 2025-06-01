// backend/controllers/car-controller.js
const Car = require('../model/Car');
const { uploadToCloudinary } = require('../helpers/cloudinary-helpers');
const fs = require('fs');

const uploadCar = async (req, res) => {
  try {
    const { brandId, name, year } = req.body;

    // Validate required fields
    if (!brandId || !name || !year) {
      return res.status(400).json({ 
        error: 'Brand ID, name, and year are required',
        success: false
      });
    }

    // Validate year
    const numericYear = parseInt(year);
    if (isNaN(numericYear)){
      return res.status(400).json({ 
        error: 'Year must be a valid number',
        success: false
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        error: 'At least one image is required',
        success: false
      });
    }

    // Upload images to Cloudinary
    const uploadedImages = await uploadToCloudinary(
      req.files.map(file => file.path)
    );
    
    // Clean up temporary files
    req.files.forEach(file => fs.unlinkSync(file.path));

    // Create new car
    const car = new Car({
      name,
      year: numericYear,
      brand: brandId,
      images: uploadedImages.map(img => ({
        url: img.url,
        publicId: img.publicId
      }))
    });

    await car.save();
    
    res.status(201).json({
      success: true,
      message: 'Car model created successfully',
      car
    });

  } catch (err) {
    console.error('Car creation error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error during car creation',
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
};

const getCars = async (req, res) => {
  try {
    const { brandId } = req.query;
    const filter = brandId ? { brand: brandId } : {}; // Changed from brandId to brand
    const cars = await Car.find(filter).populate('brand');
    res.status(200).json(cars);
  } catch (err) {
    console.error('Error fetching cars:', err);
    res.status(500).json({ 
      error: 'Failed to fetch cars',
      details: err.message 
    });
  }
};


module.exports = { uploadCar ,getCars};
