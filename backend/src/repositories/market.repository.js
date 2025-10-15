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
  const likeTerm = `%${term}%`;
  const prefixTerm = `${term}%`;

  const { rows } = await db.query(
    `${BASE_SELECT}
     where symbol ilike $1
        or name ilike $1
        or exchange ilike $1
     order by
        case
          when symbol ilike $2 then 0
          when name ilike $2 then 1
          when symbol ilike $1 then 2
          when name ilike $1 then 3
          when exchange ilike $1 then 4
          else 5
        end,
        symbol asc
     limit $3`,
    [likeTerm, prefixTerm, limit]
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
