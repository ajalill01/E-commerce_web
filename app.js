require("dotenv").config();

const express= require("express");
const rateLimit = require('express-rate-limit');
const cors = require('cors')
const sanitize = require('./backend/middleware/sanitize'); 
const helmet = require('helmet');


// const dotenv = require('dotenv');
// const createAdmin = require('./backend/controllers/add-admin');

const app = express();

app.use(helmet());


const authRoutes = require('./backend/routes/auth-route');
const brandRoutes = require('./backend/routes/brand-route');
const carRoutes = require('./backend/routes/car-route');
const productRoutes = require('./backend/routes/product-route');
const orderRoutes = require('./backend/routes/orders-route');
const statsRoute = require("./backend/routes/statsRoute");



const consectDB=require("./backend/database/db.js"); 
app.use(cors())
app.use(express.json());

app.use(sanitize);



const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.',
  });
  
app.use(globalLimiter);

app.use('/api/auth',authRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use("/api/stats", statsRoute);


const PORT= process.env.PORT||3000;


consectDB();
app.listen(PORT,()=>{
    console.log("server is on");
});

// createAdmin();