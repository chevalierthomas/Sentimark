import { Router } from 'express';
import { asyncHandler } from '../utils/async-handler.js';
import { fetchMarketNews } from '../services/market-news-client.js';
import {
  findMarketBySymbol,
  listMarkets,
  searchMarkets
} from '../repositories/market.repository.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = (req.query.q ?? '').toString().trim().toLowerCase();
    if (!query) {
      const defaults = await listMarkets(10);
      res.json(defaults);
      return;
    }

    const filtered = await searchMarkets(query, 12);

    res.json(filtered);
  })
);

router.get(
  '/:symbol/news',
  asyncHandler(async (req, res) => {
    const symbol = req.params.symbol.toString().toUpperCase();
    const market = await findMarketBySymbol(symbol);

    if (!market) {
      res.status(404).json({ message: `Market with symbol ${symbol} was not found.` });
      return;
    }

    const items = await fetchMarketNews(symbol);

    res.json({
      symbol,
      market,
      items
    });
  })
);

export default router;
