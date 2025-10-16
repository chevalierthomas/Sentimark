import { db } from '../db/index.js';

const DETAIL_SELECT = `
  select
    id,
    symbol,
    name,
    exchange,
    sector,
    industry,
    country,
    website,
    founded_year,
    employees,
    market_cap
  from companies
`;

const SEARCH_SELECT = DETAIL_SELECT;

const PRICE_SELECT = `
  select
    timestamp,
    open_price,
    close_price,
    high_price,
    low_price,
    volume,
    currency
  from stock_prices
  where company_id = $1
  order by timestamp desc
  limit $2
`;

const FINANCIAL_SELECT = `
  select
    fiscal_year,
    revenue,
    net_income,
    eps,
    pe_ratio,
    dividend_yield,
    debt_to_equity,
    roe,
    free_cash_flow
  from financials
  where company_id = $1
  order by fiscal_year desc
  limit $2
`;

const NEWS_SELECT = `
  select
    id,
    source,
    title,
    content,
    published_at,
    sentiment
  from news
  where company_id = $1
  order by published_at desc
  limit $2
`;

const INDEX_SELECT = `
  select
    i.id,
    i.name,
    i.country,
    i.currency
  from index_memberships im
  inner join indices i on i.id = im.index_id
  where im.company_id = $1
  order by i.name asc
`;

function mapCompanyRow(row) {
  return {
    id: row.id,
    symbol: row.symbol?.toUpperCase?.() ?? row.symbol,
    name: row.name,
    exchange: row.exchange?.toUpperCase?.() ?? row.exchange,
    sector: row.sector,
    industry: row.industry,
    country: row.country,
    website: row.website,
    foundedYear: row.founded_year,
    employees: row.employees,
    marketCap: row.market_cap == null ? null : Number(row.market_cap),
    listing: `${row.symbol?.toUpperCase?.() ?? row.symbol}@${row.exchange?.toUpperCase?.() ?? row.exchange}`
  };
}

function mapPriceRow(row) {
  return {
    timestamp: row.timestamp,
    open: row.open_price,
    close: row.close_price,
    high: row.high_price,
    low: row.low_price,
    volume: Number(row.volume),
    currency: row.currency
  };
}

function mapFinancialRow(row) {
  return {
    fiscalYear: row.fiscal_year,
    revenue: row.revenue,
    netIncome: row.net_income,
    eps: row.eps,
    peRatio: row.pe_ratio,
    dividendYield: row.dividend_yield,
    debtToEquity: row.debt_to_equity,
    roe: row.roe,
    freeCashFlow: row.free_cash_flow
  };
}

function mapNewsRow(row) {
  return {
    id: row.id,
    source: row.source,
    title: row.title,
    content: row.content,
    publishedAt: row.published_at,
    sentiment: row.sentiment,
    url: row.url ?? null
  };
}

function mapIndexRow(row) {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    currency: row.currency
  };
}

export async function listCompanies(limit = 10) {
  const { rows } = await db.query(
    `${SEARCH_SELECT} order by market_cap desc nulls last, symbol asc, exchange asc limit $1`,
    [limit]
  );

  return rows.map(mapCompanyRow);
}

export async function searchCompanies(term, limit = 12) {
  const likeTerm = `%${term}%`;
  const prefixTerm = `${term}%`;

  const { rows } = await db.query(
    `${SEARCH_SELECT}
     where symbol ilike $1
        or name ilike $1
        or exchange ilike $1
        or coalesce(sector, '') ilike $1
        or coalesce(industry, '') ilike $1
        or coalesce(country, '') ilike $1
     order by
        case
          when symbol ilike $2 then 0
          when name ilike $2 then 1
          when symbol ilike $1 then 2
          when name ilike $1 then 3
          when exchange ilike $1 then 4
          when coalesce(sector, '') ilike $1 then 5
          when coalesce(industry, '') ilike $1 then 6
          else 7
        end,
        symbol asc,
        exchange asc
     limit $3`,
    [likeTerm, prefixTerm, limit]
  );

  return rows.map(mapCompanyRow);
}

export async function findCompanyById(id) {
  const { rows } = await db.query(
    `${DETAIL_SELECT}
     where id = $1
     limit 1`,
    [id]
  );

  const company = rows[0];

  return company ? mapCompanyRow(company) : null;
}

export async function findCompanyBySymbol(symbol, exchange) {
  const params = [symbol];
  let whereClause = 'where upper(symbol) = upper($1)';

  if (exchange) {
    params.push(exchange);
    whereClause += ' and upper(exchange) = upper($2)';
  }

  const { rows } = await db.query(
    `${DETAIL_SELECT}
     ${whereClause}
     order by market_cap desc nulls last, exchange asc
     limit 1`,
    params
  );

  const company = rows[0];

  return company ? mapCompanyRow(company) : null;
}

export async function getCompanySnapshot(id, { priceLimit = 30, financialLimit = 4, newsLimit = 5 } = {}) {
  const { rows } = await db.query(
    `${DETAIL_SELECT}
     where id = $1
     limit 1`,
    [id]
  );

  const companyRow = rows[0];
  if (!companyRow) {
    return null;
  }

  const companyId = companyRow.id;

  const [priceResult, financialResult, newsResult, indexResult] = await Promise.all([
    db.query(PRICE_SELECT, [companyId, priceLimit]),
    db.query(FINANCIAL_SELECT, [companyId, financialLimit]),
    db.query(NEWS_SELECT, [companyId, newsLimit]),
    db.query(INDEX_SELECT, [companyId])
  ]);

  const priceHistory = priceResult.rows.map(mapPriceRow);

  return {
    company: mapCompanyRow(companyRow),
    latestPrice: priceHistory[0] ?? null,
    priceHistory,
    financials: financialResult.rows.map(mapFinancialRow),
    news: newsResult.rows.map(mapNewsRow),
    indices: indexResult.rows.map(mapIndexRow)
  };
}
