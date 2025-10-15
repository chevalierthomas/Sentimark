import { Router } from 'express';
import { asyncHandler } from '../utils/async-handler.js';
import { fetchCompanyNews } from '../services/company-news-client.js';
import { findCompanyBySymbol, listCompanies, searchCompanies } from '../repositories/company.repository.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = (req.query.q ?? '').toString().trim().toLowerCase();
    if (!query) {
      const defaults = await listCompanies(10);
      res.json(defaults);
      return;
    }

    const filtered = await searchCompanies(query, 12);

    res.json(filtered);
  })
);

router.get(
  '/:symbol/news',
  asyncHandler(async (req, res) => {
    const symbol = req.params.symbol.toString().toUpperCase();
    const company = await findCompanyBySymbol(symbol);

    if (!company) {
      res.status(404).json({ message: `Company with symbol ${symbol} was not found.` });
      return;
    }

    const items = await fetchCompanyNews(symbol);

    res.json({
      symbol,
      company,
      items
    });
  })
);

export default router;
