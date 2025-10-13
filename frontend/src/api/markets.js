import client from './client';

export async function fetchMarkets(query = '') {
  const response = await client.get('/markets', {
    params: { q: query }
  });
  return response.data;
}
