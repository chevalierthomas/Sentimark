import axios from 'axios';

function normalizeNewsItem(identifier, item, index) {
  const id = item.id ?? item.guid ?? `${identifier}-${index}`;
  const publishedAt =
    item.publishedAt ?? item.published_at ?? item.datetime ?? item.date ?? new Date().toISOString();

  return {
    id,
    source: item.source ?? item.provider ?? item.author ?? 'Unknown',
    title: item.title ?? item.headline ?? 'Untitled story',
    content: item.content ?? item.summary ?? item.description ?? '',
    publishedAt,
    sentiment: item.sentiment ?? item.score ?? null,
    url: item.url ?? item.link ?? null
  };
}

export async function fetchCompanyNews(symbol, exchange) {
  const baseURL = process.env.MARKET_NEWS_URL;
  const identifier = exchange ? `${symbol.toUpperCase()}@${exchange.toUpperCase()}` : symbol.toUpperCase();

  if (!baseURL) {
    return [
      {
        id: `demo-${identifier}`,
        source: 'Sentimark Demo',
        title: `${identifier} sentiment feed placeholder`,
        content:
          'Connect MARKET_NEWS_URL and MARKET_NEWS_KEY in your environment to proxy real company headlines.',
        publishedAt: new Date().toISOString(),
        sentiment: 0,
        url: 'https://sentimark.localhost/news'
      }
    ];
  }

  const params = {
    symbol,
    ...(exchange ? { exchange } : {}),
    ...(process.env.MARKET_NEWS_KEY ? { apikey: process.env.MARKET_NEWS_KEY } : {})
  };

  const client = axios.create({
    baseURL,
    timeout: 5000
  });

  const { data } = await client.get('', {
    params
  });

  const rawItems = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.data)
    ? data.data
    : data
    ? [data]
    : [];

  return rawItems.map((item, index) => normalizeNewsItem(identifier, item, index));
}
