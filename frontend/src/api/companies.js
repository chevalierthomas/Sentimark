import client from './client';

export async function fetchCompanies(query = '') {
  const response = await client.get('/companies', {
    params: { q: query }
  });
  return response.data;
}

export async function fetchCompanySnapshot(id) {
  const response = await client.get(`/companies/${encodeURIComponent(id)}`);
  return response.data;
}

export async function fetchCompanyNews(id) {
  const response = await client.get(`/companies/${encodeURIComponent(id)}/news`);
  return response.data;
}
