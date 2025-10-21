import { Router } from 'express';
import { asyncHandler } from '../utils/async-handler.js';
import { createAccessToken, createRefreshToken } from '../utils/token.js';
import { authenticateUser } from '../services/auth-service.js';

const router = Router();

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password, remember } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    const accessToken = createAccessToken(user);
    const refreshToken = remember ? createRefreshToken(user) : undefined;

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles
      },
      tokens: {
        accessToken,
        ...(refreshToken ? { refreshToken } : {})
      }
    });
  })
);

export default router;
