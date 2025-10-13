import { Router } from 'express';
import { markets } from '../data/markets.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = (req.query.q ?? '').toString().trim().toLowerCase();
    if (!query) {
      res.json(markets.slice(0, 10));
      return;
    }

    const filtered = markets
      .filter((market) => {
        const haystack = `${market.symbol} ${market.name} ${market.exchange}`.toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 12);

    res.json(filtered);
  })
);

export default router;
