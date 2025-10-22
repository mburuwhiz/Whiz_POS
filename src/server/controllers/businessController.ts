import { Request, Response } from 'express';
import Business from '../models/Business';
import User from '../models/User';
import { v4 as uuidv4 } from 'uuid'; // To generate a unique API key

// @desc    Register a new business and its first admin user
export const registerBusiness = async (req: Request, res: Response) => {
  const {
    businessName,
    adminName,
    adminEmail,
    adminPassword,
    adminPin,
    subscriptionPlan,
  } = req.body;

  try {
    // Check if a user with this email already exists
    const userExists = await User.findOne({ email: adminEmail });
    if (userExists) {
      return res.status(400).json({ message: 'An admin with this email already exists.' });
    }

    // 1. Create the new business
    const newBusiness = new Business({
      name: businessName,
      apiKey: uuidv4(), // Generate a unique API key
      subscriptionPlan: subscriptionPlan || 'Free',
    });
    const savedBusiness = await newBusiness.save();

    // 2. Create the initial admin user for this business
    const adminUser = new User({
      businessId: savedBusiness._id,
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      pin: adminPin,
      role: 'Admin',
    });
    await adminUser.save();

    res.status(201).json({
      message: 'Business and Admin user registered successfully.',
      business: {
        id: savedBusiness._id,
        name: savedBusiness.name,
        apiKey: savedBusiness.apiKey,
      },
      admin: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during business registration.' });
  }
};
