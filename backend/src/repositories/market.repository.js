import { db } from '../db/index.js';

const BASE_SELECT = `
  select
    symbol,
    name,
    exchange
  from markets
`;

export async function listMarkets(limit = 10) {
  const { rows } = await db.query(`${BASE_SELECT} order by symbol asc limit $1`, [limit]);
  return rows;
}

export async function searchMarkets(term, limit = 12) {
  const { rows } = await db.query(
    `${BASE_SELECT}
     where symbol ilike $1
        or name ilike $1
        or exchange ilike $1
     order by symbol asc
     limit $2`,
    [`%${term}%`, limit]
  );

  return rows;
}

export async function findMarketBySymbol(symbol) {
  const { rows } = await db.query(
    `${BASE_SELECT}
     where upper(symbol) = upper($1)
     limit 1`,
    [symbol]
  );

  return rows[0] ?? null;
}
