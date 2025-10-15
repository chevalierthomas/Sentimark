import client from './client';

export async function fetchCompanies(query = '') {
  const response = await client.get('/companies', {
    params: { q: query }
  });
  return response.data;
}

export async function fetchCompanySnapshot(symbol) {
  const response = await client.get(`/companies/${encodeURIComponent(symbol)}`);
  return response.data;
}

export async function fetchCompanyNews(symbol) {
  const response = await client.get(`/companies/${encodeURIComponent(symbol)}/news`);
  return response.data;
}
