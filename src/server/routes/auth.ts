import { Router } from 'express';
import { loginPassword, loginPin } from '../controllers/authController';

const router = Router();

// @route   POST api/auth/login/password
// @desc    Login user with email and password
// @access  Public
router.post('/login/password', loginPassword);

// @route   POST api/auth/login/pin
// @desc    Login user with email and PIN
// @access  Public
router.post('/login/pin', loginPin);

export default router;
