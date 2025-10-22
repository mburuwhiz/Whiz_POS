import { Router } from 'express';
import { registerBusiness } from '../controllers/businessController';
import { protectWithRegistrationCode } from '../middleware/authMiddleware';

const router = Router();

// @route   POST api/business/register
// @desc    Register a new business
// @access  Private (requires secret registration code)
router.post('/register', protectWithRegistrationCode, registerBusiness);

export default router;
