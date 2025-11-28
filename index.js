const express = require("express");
const dotEnv = require('dotenv');
const mongoose = require('mongoose');
const vendorRoutes = require('./routes/vendorRoutes');
const bodyParser = require('body-parser');
const firmRoutes = require('./routes/firmRoutes');
const productRoutes = require('./routes/productRoutes');
const cors = require('cors');
const path = require('path')

const app = express()

const PORT = process.env.PORT || 4000;

dotEnv.config();
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            'https://dashboard-end-phi.vercel.app',
            'https://swiggy-frontend-end.vercel.app',
            'http://localhost:3001',
            'https://yourfrontenddomain.com'
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept','token'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
};

app.use('*',cors(corsOptions));

if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is not defined in .env file");
    process.exit(1);
}

console.log("🔗 Attempting to connect to MongoDB...");

// MongoDB connection without deprecated options
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("✅ MongoDB connected successfully!");
    console.log("📊 Database:", mongoose.connection.db.databaseName);
})
.catch((error) => {
    console.log("❌ MongoDB connection failed!");
    console.log("🔍 Error details:", error.message);
    console.log("📝 Please check the following:");
    console.log("1. 🌐 Your internet connection");
    console.log("2. 🔧 MongoDB Atlas cluster status");
    console.log("3. 📍 IP whitelisting in MongoDB Atlas");
    console.log("4. 🔑 Database user credentials in .env file");
    console.log("5. ✅ MongoDB connection string format");
    process.exit(1);
});

app.use(bodyParser.json());
app.use('/vendor', vendorRoutes);
app.use('/firm', firmRoutes)
app.use('/product', productRoutes);
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
    console.log(`server started and running at ${PORT}`);
});

app.use('/', (req, res) => {
    res.send("<h1> Welcome to SUBY");
})