const Firm = require('../models/Firm');
const Vendor = require('../models/Vendor');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/'); // Destination folder where the uploaded images will be stored
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Generating a unique filename
    }
});

const upload = multer({ storage: storage });

const addFirm = async (req, res) => {
    try {
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);
        console.log("Vendor ID from token:", req.vendorId);

        const { firmName, area, category, region, offer } = req.body;

        // Check if required fields are present
        if (!firmName || !area) {
            return res.status(400).json({ 
                message: "Firm name and area are required" 
            });
        }

        const image = req.file ? req.file.filename : undefined;

        // Find vendor
        const vendor = await Vendor.findById(req.vendorId);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        // Check if vendor already has a firm
        if (vendor.firm.length > 0) {
            return res.status(400).json({ message: "Vendor can have only one firm" });
        }

        // Create new firm
        const firm = new Firm({
            firmName,
            area,
            category: Array.isArray(category) ? category : [category],
            region: Array.isArray(region) ? region : [region],
            offer,
            image,
            vendor: vendor._id
        });

        const savedFirm = await firm.save();
        console.log("Firm saved successfully:", savedFirm);

        // Update vendor with firm reference
        vendor.firm.push(savedFirm);
        await vendor.save();

        return res.status(201).json({ 
            message: 'Firm added successfully', 
            firmId: savedFirm._id, 
            vendorFirmName: savedFirm.firmName 
        });

    } catch (error) {
        console.error("Error in addFirm:", error);
        res.status(500).json({ 
            message: "Internal server error",
            error: error.message 
        });
    }
}

const deleteFirmById = async(req, res) => {
    try {
        const firmId = req.params.firmId;

        const deletedProduct = await Firm.findByIdAndDelete(firmId);

        if (!deletedProduct) {
            return res.status(404).json({ error: "No product found" })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" })
    }
}

module.exports = { addFirm: [upload.single('image'), addFirm], deleteFirmById }