import { Router } from 'express';
import { register, loginPassword, loginPin } from '../controllers/authController';

const router = Router();

// @route   POST api/auth/register
// @desc    Register a new user (admin-only)
// @access  Private (to be protected by admin middleware)
router.post('/register', register);

// @route   POST api/auth/login/password
// @desc    Login user with email and password
// @access  Public
router.post('/login/password', loginPassword);

// @route   POST api/auth/login/pin
// @desc    Login user with email and PIN
// @access  Public
router.post('/login/pin', loginPin);

export default router;
