import { Router } from 'express';
import {
  createSale,
  getSales,
  getSaleById,
} from '../controllers/saleController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// All roles can create a sale (Cashier, Manager, Admin)
// and view sales history.
router.route('/').post(protect, createSale).get(protect, getSales);

router.route('/:id').get(protect, getSaleById);

export default router;
