-- Sentimark database schema
-- Enable extensions used by the application
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    roles TEXT[] NOT NULL DEFAULT ARRAY['analyst'],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    symbol CITEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(120),
    industry VARCHAR(120),
    country VARCHAR(120),
    exchange CITEXT NOT NULL,
    website TEXT,
    founded_year INT,
    employees INT,
    market_cap NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP INDEX IF EXISTS companies_symbol_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_symbol_exchange_unique
    ON companies (symbol, exchange);

CREATE TABLE IF NOT EXISTS stock_prices (
    id BIGSERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    open_price DOUBLE PRECISION NOT NULL,
    close_price DOUBLE PRECISION NOT NULL,
    high_price DOUBLE PRECISION NOT NULL,
    low_price DOUBLE PRECISION NOT NULL,
    volume BIGINT NOT NULL,
    currency VARCHAR(16) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (company_id, timestamp)
);

CREATE TABLE IF NOT EXISTS financials (
    company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    fiscal_year INT NOT NULL,
    revenue DOUBLE PRECISION,
    net_income DOUBLE PRECISION,
    eps DOUBLE PRECISION,
    pe_ratio DOUBLE PRECISION,
    dividend_yield DOUBLE PRECISION,
    debt_to_equity DOUBLE PRECISION,
    roe DOUBLE PRECISION,
    free_cash_flow DOUBLE PRECISION,
    PRIMARY KEY (company_id, fiscal_year)
);

CREATE TABLE IF NOT EXISTS news (
    id BIGSERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    source VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    url TEXT,
    published_at TIMESTAMPTZ NOT NULL,
    sentiment DOUBLE PRECISION,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (company_id, title, published_at)
);

CREATE TABLE IF NOT EXISTS indices (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    country VARCHAR(120),
    currency VARCHAR(16)
);

CREATE TABLE IF NOT EXISTS index_memberships (
    index_id INT NOT NULL REFERENCES indices(id) ON DELETE CASCADE,
    company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    PRIMARY KEY (index_id, company_id)
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS companies_set_updated_at ON companies;
CREATE TRIGGER companies_set_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

CREATE INDEX IF NOT EXISTS idx_companies_symbol ON companies (symbol);
CREATE INDEX IF NOT EXISTS idx_companies_exchange ON companies (exchange);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies USING GIN (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_stock_prices_company_timestamp ON stock_prices (company_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_news_company_published_at ON news (company_id, published_at DESC);
