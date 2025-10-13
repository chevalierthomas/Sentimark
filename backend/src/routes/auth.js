import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { users } from '../data/users.js';
import { asyncHandler } from '../utils/async-handler.js';
import { createAccessToken, createRefreshToken } from '../utils/token.js';

const router = Router();

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password, remember } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
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
