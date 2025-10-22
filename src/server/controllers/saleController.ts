import { Response } from 'express';
import Sale from '../models/Sale';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Create a new sale
export const createSale = async (req: AuthRequest, res: Response) => {
  const { products, paymentMethod } = req.body; // products is an array of { productId, quantity }

  if (!products || products.length === 0) {
    return res.status(400).json({ message: 'No products in sale' });
  }

  try {
    // 1. Fetch product details from DB and calculate total amount
    let totalAmount = 0;
    const saleProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product with id ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }

      totalAmount += product.price * item.quantity;
      saleProducts.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price, // Record price at time of sale
      });
    }

    // 2. Create the sale
    const sale = new Sale({
      businessId: req.user.businessId,
      userId: req.user._id,
      products: saleProducts,
      totalAmount,
      paymentMethod,
    });

    const createdSale = await sale.save();

    // 3. Update stock for each product
    for (const item of products) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json(createdSale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating sale.' });
  }
};

// @desc    Get all sales for the logged-in user's business
export const getSales = async (req: AuthRequest, res: Response) => {
  try {
    const sales = await Sale.find({ businessId: req.user.businessId })
      .populate('userId', 'name')
      .populate('products.productId', 'name');
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single sale by ID
export const getSaleById = async (req: AuthRequest, res: Response) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (sale && sale.businessId.toString() === req.user.businessId.toString()) {
      res.json(sale);
    } else {
      res.status(404).json({ message: 'Sale not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
