import client from './client';

export async function fetchCompanies(query = '') {
  const response = await client.get('/companies', {
    params: { q: query }
  });
  return response.data;
}
