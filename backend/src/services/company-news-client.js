import axios from 'axios';

export async function fetchCompanyNews(symbol) {
  const baseURL = process.env.MARKET_NEWS_URL;

  if (!baseURL) {
    const uppercaseSymbol = symbol.toUpperCase();
    return [
      {
        id: `demo-${uppercaseSymbol}`,
        headline: `${uppercaseSymbol} sentiment feed placeholder`,
        summary:
          'Connect MARKET_NEWS_URL and MARKET_NEWS_KEY in your environment to proxy real company headlines.',
        source: 'Sentimark Demo',
        url: 'https://sentimark.localhost/news',
        publishedAt: new Date().toISOString()
      }
    ];
  }

  const params = {
    symbol,
    ...(process.env.MARKET_NEWS_KEY ? { apikey: process.env.MARKET_NEWS_KEY } : {})
  };

  const client = axios.create({
    baseURL,
    timeout: 5000
  });

  const { data } = await client.get('', {
    params
  });

  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.items)) {
    return data.items;
  }

  if (data && Array.isArray(data.data)) {
    return data.data;
  }

  return data ? [data] : [];
}
