import { Router } from 'express';
import { asyncHandler } from '../utils/async-handler.js';
import { fetchCompanyNews } from '../services/company-news-client.js';
import {
  findCompanyById,
  getCompanySnapshot,
  listCompanies,
  searchCompanies
} from '../repositories/company.repository.js';
import { requireAuth } from '../middleware/auth.js';

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
  '/:companyId/news',
  asyncHandler(async (req, res) => {
    const companyId = Number.parseInt(req.params.companyId, 10);

    if (Number.isNaN(companyId) || companyId <= 0) {
      res.status(400).json({ message: 'Company id must be a positive integer.' });
      return;
    }

    const company = await findCompanyById(companyId);

    if (!company) {
      res.status(404).json({ message: `Company with id ${companyId} was not found.` });
      return;
    }

    const items = await fetchCompanyNews(company.symbol, company.exchange);

    res.json({
      company,
      items
    });
  })
);

router.get(
  '/:companyId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const companyId = Number.parseInt(req.params.companyId, 10);

    if (Number.isNaN(companyId) || companyId <= 0) {
      res.status(400).json({ message: 'Company id must be a positive integer.' });
      return;
    }

    const snapshot = await getCompanySnapshot(companyId, {
      priceLimit: 3650,
      financialLimit: 10
    });

    if (!snapshot) {
      res.status(404).json({ message: `Company with id ${companyId} was not found.` });
      return;
    }

    res.json(snapshot);
  })
);

export default router;
