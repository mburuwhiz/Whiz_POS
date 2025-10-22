import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router
  .route('/')
  .get(protect, getProducts)
  .post(protect, authorize('Admin', 'Manager'), createProduct);

router
  .route('/:id')
  .get(protect, getProductById)
  .put(protect, authorize('Admin', 'Manager'), updateProduct)
  .delete(protect, authorize('Admin', 'Manager'), deleteProduct);

export default router;
