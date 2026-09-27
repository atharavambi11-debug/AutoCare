// server/controllers/serviceController.js
// Purpose: Handle all service-related operations

const Service = require("../models/Service");

/**
 * @desc    Get all services
 * @route   GET /api/services
 * @access  Public
 */
const getAllServices = async (req, res) => {
  try {
    // Support optional search query parameter
    const { search, category } = req.query;

    // Build filter object dynamically
    let filter = {};

    if (search) {
      // Case-insensitive search on name and description
      filter.$or = [
        { serviceName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    // Fetch services sorted by creation date (newest first)
    const services = await Service.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Get Services Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching services",
    });
  }
};

/**
 * @desc    Get a single service by ID
 * @route   GET /api/services/:id
 * @access  Public
 */
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Get Service Error:", error);

    // Handle invalid MongoDB ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error fetching service",
    });
  }
};

/**
 * @desc    Create a new service
 * @route   POST /api/services
 * @access  Private/Admin
 */
const createService = async (req, res) => {
  try {
    const { serviceName, description, price, category, duration, features, image } =
      req.body;

    // Validate required fields
    if (!serviceName || !description || !price) {
      return res.status(400).json({
        success: false,
        message: "Service name, description, and price are required",
      });
    }

    // Check if service with same name already exists
    const existingService = await Service.findOne({
      serviceName: { $regex: `^${serviceName}$`, $options: "i" },
    });

    if (existingService) {
      return res.status(400).json({
        success: false,
        message: "A service with this name already exists",
      });
    }

    // Create the service
    const service = await Service.create({
      serviceName,
      description,
      price: Number(price),
      category: category || "Other",
      duration: duration || "60-90 minutes",
      features: features || [],
      image: image || "",
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error("Create Service Error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error creating service",
    });
  }
};

/**
 * @desc    Update a service
 * @route   PUT /api/services/:id
 * @access  Private/Admin
 */
const updateService = async (req, res) => {
  try {
    // Check if service exists
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Update the service with new data
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators
      }
    );

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("Update Service Error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error updating service",
    });
  }
};

/**
 * @desc    Delete a service
 * @route   DELETE /api/services/:id
 * @access  Private/Admin
 */
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete Service Error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error deleting service",
    });
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};