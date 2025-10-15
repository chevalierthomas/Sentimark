import { db } from '../db/index.js';

const BASE_SELECT = `
  select
    id,
    symbol,
    name,
    exchange,
    sector,
    industry,
    country
  from companies
`;

export async function listCompanies(limit = 10) {
  const { rows } = await db.query(`${BASE_SELECT} order by market_cap desc nulls last, symbol asc limit $1`, [limit]);
  return rows;
}

export async function searchCompanies(term, limit = 12) {
  const likeTerm = `%${term}%`;
  const prefixTerm = `${term}%`;

  const { rows } = await db.query(
    `${BASE_SELECT}
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
        symbol asc
     limit $3`,
    [likeTerm, prefixTerm, limit]
  );

  return rows;
}

export async function findCompanyBySymbol(symbol) {
  const { rows } = await db.query(
    `${BASE_SELECT}
     where upper(symbol) = upper($1)
     limit 1`,
    [symbol]
  );

  return rows[0] ?? null;
}
