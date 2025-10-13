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

-- Markets
INSERT INTO markets (symbol, name, exchange) VALUES
    ('AAPL', 'Apple Inc.', 'NASDAQ'),
    ('MSFT', 'Microsoft Corporation', 'NASDAQ'),
    ('GOOGL', 'Alphabet Inc. Class A', 'NASDAQ'),
    ('AMZN', 'Amazon.com, Inc.', 'NASDAQ'),
    ('TSLA', 'Tesla, Inc.', 'NASDAQ'),
    ('NVDA', 'NVIDIA Corporation', 'NASDAQ'),
    ('META', 'Meta Platforms, Inc.', 'NASDAQ'),
    ('NFLX', 'Netflix, Inc.', 'NASDAQ'),
    ('BABA', 'Alibaba Group Holding Limited', 'NYSE'),
    ('SAP', 'SAP SE', 'NYSE'),
    ('ORCL', 'Oracle Corporation', 'NYSE'),
    ('IBM', 'International Business Machines Corporation', 'NYSE'),
    ('AIR.PA', 'Airbus SE', 'EURONEXT PARIS'),
    ('MC.PA', 'LVMH Moët Hennessy Louis Vuitton SE', 'EURONEXT PARIS'),
    ('7203.T', 'Toyota Motor Corporation', 'TOKYO'),
    ('6758.T', 'Sony Group Corporation', 'TOKYO'),
    ('INFY', 'Infosys Limited', 'NYSE'),
    ('TCS.NS', 'Tata Consultancy Services Limited', 'NSE'),
    ('VALE', 'Vale S.A.', 'NYSE'),
    ('BP', 'BP p.l.c.', 'LSE')
ON CONFLICT (symbol) DO UPDATE
SET
    name = EXCLUDED.name,
    exchange = EXCLUDED.exchange;
