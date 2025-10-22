import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('FATAL_ERROR: JWT_SECRET is not defined in the .env file');
}

// Extend Express's Request interface to include the user property
export interface AuthRequest extends Request {
  user?: any;
}

// Protect routes by verifying JWT
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded: any = jwt.verify(token, JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user?.role} is not authorized to access this route` });
    }
    next();
  };
};

// Protect business registration with a secret code
export const protectWithRegistrationCode = (req: Request, res: Response, next: NextFunction) => {
  const { registrationCode } = req.body;
  const SECRET_CODE = process.env.REGISTRATION_CODE;

  if (!SECRET_CODE) {
    throw new Error('FATAL_ERROR: REGISTRATION_CODE is not defined in the .env file');
  }

  if (registrationCode && registrationCode === SECRET_CODE) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized. Invalid registration code.' });
  }
};
