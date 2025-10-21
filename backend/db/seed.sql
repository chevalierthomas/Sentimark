-- Seed data for Sentimark development
-- Users
INSERT INTO users (id, name, email, password_hash, roles)
VALUES
    ('u-001', 'Avery Analyst', 'avery@sentimark.ai', crypt('Sentimark!2024', gen_salt('bf', 10)), ARRAY['analyst'])
ON CONFLICT (id) DO UPDATE
SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    roles = EXCLUDED.roles;

-- Companies
INSERT INTO companies (symbol, name, sector, industry, country, exchange, website, founded_year, employees, market_cap)
VALUES
    ('AAPL', 'Apple Inc.', 'Technology', 'Consumer Electronics', 'United States', 'NASDAQ', 'https://www.apple.com', 1976, 164000, 2800000000000),
    ('MSFT', 'Microsoft Corporation', 'Technology', 'Software—Infrastructure', 'United States', 'NASDAQ', 'https://www.microsoft.com', 1975, 221000, 2900000000000),
    ('AMZN', 'Amazon.com, Inc.', 'Consumer Discretionary', 'Internet Retail', 'United States', 'NASDAQ', 'https://www.amazon.com', 1994, 1540000, 1700000000000),
    ('GOOGL', 'Alphabet Inc. Class A', 'Communication Services', 'Internet Content & Information', 'United States', 'NASDAQ', 'https://abc.xyz', 2015, 182502, 1900000000000),
    ('TSLA', 'Tesla, Inc.', 'Consumer Discretionary', 'Auto Manufacturers', 'United States', 'NASDAQ', 'https://www.tesla.com', 2003, 140473, 780000000000),
    ('NVDA', 'NVIDIA Corporation', 'Technology', 'Semiconductors', 'United States', 'NASDAQ', 'https://www.nvidia.com', 1993, 26777, 2200000000000),
    ('AIR.PA', 'Airbus SE', 'Industrials', 'Aerospace & Defense', 'France', 'EURONEXT PARIS', 'https://www.airbus.com', 1970, 134000, 110000000000),
    ('MC.PA', 'LVMH Moët Hennessy Louis Vuitton SE', 'Consumer Discretionary', 'Luxury Goods', 'France', 'EURONEXT PARIS', 'https://www.lvmh.com', 1987, 213000, 420000000000),
    ('7203.T', 'Toyota Motor Corporation', 'Consumer Discretionary', 'Auto Manufacturers', 'Japan', 'TOKYO', 'https://global.toyota/en', 1937, 375235, 270000000000),
    ('INFY', 'Infosys Limited', 'Technology', 'Information Technology Services', 'India', 'NYSE', 'https://www.infosys.com', 1981, 343000, 73000000000),
    ('DELTA', 'Delta Air Lines, Inc.', 'Industrials', 'Airlines', 'United States', 'NYSE', 'https://www.delta.com', 1928, 95000, 28000000000),
    ('DELTA', 'Delta Electronics, Inc.', 'Technology', 'Electronic Components', 'Taiwan', 'TWSE', 'https://www.deltaww.com', 1971, 83000, 18000000000)
ON CONFLICT (symbol, exchange) DO UPDATE
SET
    name = EXCLUDED.name,
    sector = EXCLUDED.sector,
    industry = EXCLUDED.industry,
    country = EXCLUDED.country,
    exchange = EXCLUDED.exchange,
    website = EXCLUDED.website,
    founded_year = EXCLUDED.founded_year,
    employees = EXCLUDED.employees,
    market_cap = EXCLUDED.market_cap;

-- Stock prices (daily samples)
INSERT INTO stock_prices (company_id, timestamp, open_price, close_price, high_price, low_price, volume, currency)
VALUES
    ((SELECT id FROM companies WHERE symbol = 'AAPL' AND exchange = 'NASDAQ'), '2024-10-18T20:00:00Z', 173.21, 176.31, 176.88, 172.74, 61234567, 'USD'),
    ((SELECT id FROM companies WHERE symbol = 'MSFT' AND exchange = 'NASDAQ'), '2024-10-18T20:00:00Z', 326.85, 329.94, 331.15, 325.72, 41234000, 'USD'),
    ((SELECT id FROM companies WHERE symbol = 'AMZN' AND exchange = 'NASDAQ'), '2024-10-18T20:00:00Z', 131.22, 133.81, 134.55, 130.48, 53211000, 'USD'),
    ((SELECT id FROM companies WHERE symbol = 'GOOGL' AND exchange = 'NASDAQ'), '2024-10-18T20:00:00Z', 138.4, 139.85, 140.12, 137.92, 27340000, 'USD'),
    ((SELECT id FROM companies WHERE symbol = 'TSLA' AND exchange = 'NASDAQ'), '2024-10-18T20:00:00Z', 246.17, 249.44, 250.86, 244.9, 78900200, 'USD'),
    ((SELECT id FROM companies WHERE symbol = 'NVDA' AND exchange = 'NASDAQ'), '2024-10-18T20:00:00Z', 448.1, 452.12, 454.33, 447.5, 37220000, 'USD'),
    ((SELECT id FROM companies WHERE symbol = 'AIR.PA' AND exchange = 'EURONEXT PARIS'), '2024-10-18T20:00:00Z', 124.6, 125.4, 126.15, 123.9, 1620000, 'EUR'),
    ((SELECT id FROM companies WHERE symbol = 'MC.PA' AND exchange = 'EURONEXT PARIS'), '2024-10-18T20:00:00Z', 765.5, 770.9, 773.0, 760.2, 820000, 'EUR'),
    ((SELECT id FROM companies WHERE symbol = '7203.T' AND exchange = 'TOKYO'), '2024-10-18T20:00:00Z', 2540.0, 2568.5, 2574.0, 2531.0, 5230000, 'JPY'),
    ((SELECT id FROM companies WHERE symbol = 'INFY' AND exchange = 'NYSE'), '2024-10-18T20:00:00Z', 16.8, 17.2, 17.3, 16.7, 9400000, 'USD'),
    ((SELECT id FROM companies WHERE symbol = 'DELTA' AND exchange = 'NYSE'), '2024-10-18T20:00:00Z', 38.12, 39.45, 39.82, 37.9, 8210000, 'USD'),
    ((SELECT id FROM companies WHERE symbol = 'DELTA' AND exchange = 'TWSE'), '2024-10-18T20:00:00Z', 248.5, 251.3, 252.1, 247.2, 3640000, 'TWD')
ON CONFLICT (company_id, timestamp) DO UPDATE
SET
    open_price = EXCLUDED.open_price,
    close_price = EXCLUDED.close_price,
    high_price = EXCLUDED.high_price,
    low_price = EXCLUDED.low_price,
    volume = EXCLUDED.volume,
    currency = EXCLUDED.currency;

-- Financial statements (multi-year snapshots)
INSERT INTO financials (company_id, fiscal_year, revenue, net_income, eps, pe_ratio, dividend_yield, debt_to_equity, roe, free_cash_flow)
VALUES
    ((SELECT id FROM companies WHERE symbol = 'AAPL' AND exchange = 'NASDAQ'), 2023, 383285000000, 96995000000, 6.13, 28.1, 0.005, 1.74, 0.31, 111000000000),
    ((SELECT id FROM companies WHERE symbol = 'AAPL' AND exchange = 'NASDAQ'), 2022, 394328000000, 99803000000, 6.11, 24.3, 0.006, 1.76, 0.32, 112000000000),
    ((SELECT id FROM companies WHERE symbol = 'AAPL' AND exchange = 'NASDAQ'), 2021, 365817000000, 94680000000, 5.61, 28.7, 0.006, 1.74, 0.28, 93000000000),
    ((SELECT id FROM companies WHERE symbol = 'MSFT' AND exchange = 'NASDAQ'), 2023, 211915000000, 72461000000, 9.68, 32.6, 0.008, 0.38, 0.35, 65900000000),
    ((SELECT id FROM companies WHERE symbol = 'MSFT' AND exchange = 'NASDAQ'), 2022, 198270000000, 72740000000, 9.65, 28.4, 0.009, 0.41, 0.38, 65100000000),
    ((SELECT id FROM companies WHERE symbol = 'MSFT' AND exchange = 'NASDAQ'), 2021, 168088000000, 61271000000, 8.05, 35.1, 0.009, 0.44, 0.47, 56300000000),
    ((SELECT id FROM companies WHERE symbol = 'AMZN' AND exchange = 'NASDAQ'), 2023, 554027000000, 30328000000, 2.90, 58.4, 0, 0.89, 0.15, 36700000000),
    ((SELECT id FROM companies WHERE symbol = 'AMZN' AND exchange = 'NASDAQ'), 2022, 513983000000, -2700000000, -0.27, NULL, 0, 1.05, -0.01, -2000000000),
    ((SELECT id FROM companies WHERE symbol = 'AMZN' AND exchange = 'NASDAQ'), 2021, 469822000000, 33364000000, 3.24, 58.0, 0, 0.93, 0.24, 25000000000),
    ((SELECT id FROM companies WHERE symbol = 'GOOGL' AND exchange = 'NASDAQ'), 2023, 307394000000, 73498000000, 5.8, 26.2, 0, 0.11, 0.27, 65400000000),
    ((SELECT id FROM companies WHERE symbol = 'GOOGL' AND exchange = 'NASDAQ'), 2022, 282836000000, 59872000000, 4.63, 19.9, 0, 0.10, 0.25, 62600000000),
    ((SELECT id FROM companies WHERE symbol = 'GOOGL' AND exchange = 'NASDAQ'), 2021, 257637000000, 76033000000, 5.61, 24.7, 0, 0.11, 0.30, 67000000000),
    ((SELECT id FROM companies WHERE symbol = 'TSLA' AND exchange = 'NASDAQ'), 2023, 96800000000, 12300000000, 3.62, 65.7, 0, 0.05, 0.28, 8900000000),
    ((SELECT id FROM companies WHERE symbol = 'TSLA' AND exchange = 'NASDAQ'), 2022, 81462000000, 12556000000, 3.24, 40.5, 0, 0.08, 0.29, 7700000000),
    ((SELECT id FROM companies WHERE symbol = 'TSLA' AND exchange = 'NASDAQ'), 2021, 53823000000, 5560000000, 1.63, 110.0, 0, 0.17, 0.20, 5000000000),
    ((SELECT id FROM companies WHERE symbol = 'NVDA' AND exchange = 'NASDAQ'), 2023, 60922000000, 16300000000, 6.37, 50.2, 0.003, 0.21, 0.34, 14800000000),
    ((SELECT id FROM companies WHERE symbol = 'NVDA' AND exchange = 'NASDAQ'), 2022, 26974000000, 4400000000, 1.76, 44.3, 0.002, 0.20, 0.22, 6200000000),
    ((SELECT id FROM companies WHERE symbol = 'NVDA' AND exchange = 'NASDAQ'), 2021, 16675000000, 4360000000, 1.73, 87.6, 0.001, 0.25, 0.29, 4800000000),
    ((SELECT id FROM companies WHERE symbol = 'AIR.PA' AND exchange = 'EURONEXT PARIS'), 2023, 65000000000, 4540000000, 5.75, 27.8, 0.012, 1.12, 0.19, 6200000000),
    ((SELECT id FROM companies WHERE symbol = 'AIR.PA' AND exchange = 'EURONEXT PARIS'), 2022, 58300000000, 4500000000, 5.40, 28.1, 0.011, 1.08, 0.18, 5600000000),
    ((SELECT id FROM companies WHERE symbol = 'AIR.PA' AND exchange = 'EURONEXT PARIS'), 2021, 52500000000, 4200000000, 5.10, 32.3, 0.010, 1.15, 0.16, 5100000000),
    ((SELECT id FROM companies WHERE symbol = 'MC.PA' AND exchange = 'EURONEXT PARIS'), 2023, 86300000000, 15700000000, 29.35, 23.4, 0.016, 0.44, 0.21, 11800000000),
    ((SELECT id FROM companies WHERE symbol = 'MC.PA' AND exchange = 'EURONEXT PARIS'), 2022, 79200000000, 14200000000, 27.25, 24.5, 0.015, 0.46, 0.20, 10400000000),
    ((SELECT id FROM companies WHERE symbol = 'MC.PA' AND exchange = 'EURONEXT PARIS'), 2021, 64000000000, 12100000000, 24.35, 27.1, 0.014, 0.48, 0.18, 9300000000),
    ((SELECT id FROM companies WHERE symbol = '7203.T' AND exchange = 'TOKYO'), 2023, 279400000000, 23400000000, 7.47, 10.8, 0.025, 0.52, 0.12, 18300000000),
    ((SELECT id FROM companies WHERE symbol = '7203.T' AND exchange = 'TOKYO'), 2022, 256000000000, 19200000000, 6.45, 9.6, 0.024, 0.55, 0.11, 15800000000),
    ((SELECT id FROM companies WHERE symbol = '7203.T' AND exchange = 'TOKYO'), 2021, 245000000000, 19000000000, 6.18, 11.5, 0.023, 0.58, 0.10, 15000000000),
    ((SELECT id FROM companies WHERE symbol = 'INFY' AND exchange = 'NYSE'), 2023, 18100000000, 3100000000, 0.75, 22.1, 0.024, 0.10, 0.32, 2800000000),
    ((SELECT id FROM companies WHERE symbol = 'INFY' AND exchange = 'NYSE'), 2022, 16900000000, 2800000000, 0.66, 20.8, 0.023, 0.12, 0.30, 2700000000),
    ((SELECT id FROM companies WHERE symbol = 'INFY' AND exchange = 'NYSE'), 2021, 15600000000, 2600000000, 0.61, 21.2, 0.022, 0.13, 0.28, 2500000000),
    ((SELECT id FROM companies WHERE symbol = 'DELTA' AND exchange = 'NYSE'), 2023, 58600000000, 4550000000, 6.25, 7.5, 0, 1.2, 0.19, 4300000000),
    ((SELECT id FROM companies WHERE symbol = 'DELTA' AND exchange = 'NYSE'), 2022, 50200000000, 1200000000, 1.89, 19.3, 0, 1.45, 0.04, 3000000000),
    ((SELECT id FROM companies WHERE symbol = 'DELTA' AND exchange = 'NYSE'), 2021, 29800000000, -11800000000, -19.49, NULL, 0, 3.4, -0.36, -4500000000),
    ((SELECT id FROM companies WHERE symbol = 'DELTA' AND exchange = 'TWSE'), 2023, 387000000000, 29800000000, 8.15, 17.4, 0.025, 0.35, 0.21, 36000000000),
    ((SELECT id FROM companies WHERE symbol = 'DELTA' AND exchange = 'TWSE'), 2022, 352000000000, 27000000000, 7.65, 19.5, 0.024, 0.37, 0.19, 33000000000),
    ((SELECT id FROM companies WHERE symbol = 'DELTA' AND exchange = 'TWSE'), 2021, 315000000000, 24500000000, 6.85, 21.3, 0.023, 0.39, 0.18, 30000000000)
ON CONFLICT (company_id, fiscal_year) DO UPDATE
SET
    revenue = EXCLUDED.revenue,
    net_income = EXCLUDED.net_income,
    eps = EXCLUDED.eps,
    pe_ratio = EXCLUDED.pe_ratio,
    dividend_yield = EXCLUDED.dividend_yield,
    debt_to_equity = EXCLUDED.debt_to_equity,
    roe = EXCLUDED.roe,
    free_cash_flow = EXCLUDED.free_cash_flow;

-- News sentiment samples
INSERT INTO news (company_id, source, title, content, url, published_at, sentiment)
VALUES
    ((SELECT id FROM companies WHERE symbol = 'AAPL' AND exchange = 'NASDAQ'), 'Reuters', 'Apple unveils new AI features in macOS', 'Apple introduced on-device generative AI capabilities aimed at creative professionals.', 'https://www.reuters.com/technology/apple-unveils-new-ai-features-macos-2024-10-20/', '2024-10-20T14:00:00Z', 0.36),
    ((SELECT id FROM companies WHERE symbol = 'MSFT' AND exchange = 'NASDAQ'), 'Bloomberg', 'Microsoft cloud growth tops expectations', 'Azure revenue accelerated as enterprises expanded AI workloads across industries.', 'https://www.bloomberg.com/news/articles/2024-10-19/microsoft-cloud-growth-tops-expectations', '2024-10-19T09:30:00Z', 0.41),
    ((SELECT id FROM companies WHERE symbol = 'AMZN' AND exchange = 'NASDAQ'), 'CNBC', 'Amazon announces robotics expansion for fulfillment centers', 'Automation upgrades will roll out to 15 new warehouses over the next year.', 'https://www.cnbc.com/2024/10/18/amazon-robotics-expansion.html', '2024-10-18T12:10:00Z', 0.18),
    ((SELECT id FROM companies WHERE symbol = 'TSLA' AND exchange = 'NASDAQ'), 'Financial Times', 'Tesla faces regulatory scrutiny over Autopilot branding', 'European regulators are reviewing safety claims tied to driver-assistance features.', 'https://www.ft.com/content/tesla-autopilot-scrutiny-2024', '2024-10-18T06:45:00Z', -0.27),
    ((SELECT id FROM companies WHERE symbol = 'NVDA' AND exchange = 'NASDAQ'), 'Wall Street Journal', 'NVIDIA launches next-gen data center GPUs', 'The Blackwell architecture targets AI inference workloads with lower power consumption.', 'https://www.wsj.com/articles/nvidia-launches-next-gen-data-center-gpus-2024', '2024-10-17T15:25:00Z', 0.52),
    ((SELECT id FROM companies WHERE symbol = 'MC.PA' AND exchange = 'EURONEXT PARIS'), 'Les Echos', 'LVMH reports strong sales in Asia', 'Luxury demand in China rebounded, lifting quarterly revenue above analyst forecasts.', 'https://www.lesechos.fr/industrie-services/mode-luxe/lvmh-reports-asia-sales-surge-2024-10-19', '2024-10-19T17:40:00Z', 0.29),
    ((SELECT id FROM companies WHERE symbol = 'DELTA' AND exchange = 'NYSE'), 'Associated Press', 'Delta Air Lines adds new transatlantic routes', 'The carrier expands its European network for the upcoming summer season.', 'https://apnews.com/article/delta-air-lines-new-transatlantic-routes-2024', '2024-10-16T11:05:00Z', 0.21),
    ((SELECT id FROM companies WHERE symbol = 'DELTA' AND exchange = 'TWSE'), 'Taipei Times', 'Delta Electronics invests in smart manufacturing hub', 'New facilities will boost automation offerings aimed at EV manufacturers.', 'https://www.taipeitimes.com/News/biz/archives/2024/10/15/2003820', '2024-10-15T05:30:00Z', 0.34)
ON CONFLICT (company_id, title, published_at) DO UPDATE
SET
    source = EXCLUDED.source,
    content = EXCLUDED.content,
    url = EXCLUDED.url,
    sentiment = EXCLUDED.sentiment;

-- Indices
INSERT INTO indices (name, country, currency)
VALUES
    ('S&P 500', 'United States', 'USD'),
    ('NASDAQ-100', 'United States', 'USD'),
    ('CAC 40', 'France', 'EUR')
ON CONFLICT (name) DO UPDATE
SET
    country = EXCLUDED.country,
    currency = EXCLUDED.currency;

-- Index memberships
INSERT INTO index_memberships (index_id, company_id)
VALUES
    ((SELECT id FROM indices WHERE name = 'S&P 500'), (SELECT id FROM companies WHERE symbol = 'AAPL' AND exchange = 'NASDAQ')),
    ((SELECT id FROM indices WHERE name = 'S&P 500'), (SELECT id FROM companies WHERE symbol = 'MSFT' AND exchange = 'NASDAQ')),
    ((SELECT id FROM indices WHERE name = 'S&P 500'), (SELECT id FROM companies WHERE symbol = 'AMZN' AND exchange = 'NASDAQ')),
    ((SELECT id FROM indices WHERE name = 'S&P 500'), (SELECT id FROM companies WHERE symbol = 'GOOGL' AND exchange = 'NASDAQ')),
    ((SELECT id FROM indices WHERE name = 'S&P 500'), (SELECT id FROM companies WHERE symbol = 'TSLA' AND exchange = 'NASDAQ')),
    ((SELECT id FROM indices WHERE name = 'NASDAQ-100'), (SELECT id FROM companies WHERE symbol = 'NVDA' AND exchange = 'NASDAQ')),
    ((SELECT id FROM indices WHERE name = 'NASDAQ-100'), (SELECT id FROM companies WHERE symbol = 'AAPL' AND exchange = 'NASDAQ')),
    ((SELECT id FROM indices WHERE name = 'NASDAQ-100'), (SELECT id FROM companies WHERE symbol = 'MSFT' AND exchange = 'NASDAQ')),
    ((SELECT id FROM indices WHERE name = 'CAC 40'), (SELECT id FROM companies WHERE symbol = 'AIR.PA' AND exchange = 'EURONEXT PARIS')),
    ((SELECT id FROM indices WHERE name = 'CAC 40'), (SELECT id FROM companies WHERE symbol = 'MC.PA' AND exchange = 'EURONEXT PARIS'))
ON CONFLICT DO NOTHING;
