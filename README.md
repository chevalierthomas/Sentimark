# Sentimark

Sentimark is a market sentiment analysis platform. This initial milestone focuses on the
front-end welcome experience backed by a secure Node.js API skeleton.

## Project structure

```
Sentimark/
├── frontend/    # Vue 3 single page application powered by Vite
└── backend/     # Node.js API server using Express
```

## Frontend (Vue 3 + Vite)

The welcome screen showcases a company discovery bar with keyboard-friendly autocompletion and a
secure login form. Once authenticated you can jump straight from the search suggestions to a
company dashboard that visualises fundamentals, recent pricing, and curated sentiment headlines.
Axios is configured with an interceptor to safely communicate with the backend and automatically
attaches your JWT access token after sign-in.

### Getting started

```bash
cd frontend
npm install
npm run dev
```

> **Note**
> The frontend now targets Vite 4 so it can run on Node.js 16 LTS or newer, matching the constraints of older development machines.

Create a `.env` file based on `.env.example` if you need to override the default API URL.

## Backend (Node.js + Express)

The backend exposes:

- `GET /api/companies` – search endpoint with server-side filtering backed by PostgreSQL
- `GET /api/companies/:symbol` – detailed fundamentals and news snapshot (requires a bearer token)
- `GET /api/companies/:symbol/news` – proxies sentiment headlines via Axios (falls back to demo data when no API is configured)
- `POST /api/auth/login` – credential check returning short-lived JWTs using database-backed users

Requests to the snapshot endpoint must include an `Authorization: Bearer <accessToken>` header
using the token returned from the login route.

Security middleware such as Helmet, CORS, and request logging with Morgan are pre-configured.

### Getting started

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

`.env.development` is loaded automatically when a custom `.env` is not present. It targets the bundled Docker database (see below) using the `sentimark_app` user and `sentimark_dev` database.

Update the `JWT_SECRET` value in `.env` before running in production. Provide a `MARKET_NEWS_URL` (and optional `MARKET_NEWS_KEY`) to enable live Axios calls to your preferred company news provider.

Interactive API documentation is available once the server is running at `http://localhost:4000/api/docs` (with the raw OpenAPI JSON at `/api/docs.json`).

### Database

Sentimark uses PostgreSQL for persistent storage. A schema and seed dataset are included under `backend/db/` and define:

- `companies` – canonical reference data for issuers (ticker, exchange, fundamentals)
- `stock_prices` – time series of daily price and volume snapshots
- `financials` – annual fundamentals such as revenue, EPS, and free cash flow
- `news` – curated sentiment scores for recent company headlines
- `indices` & `index_memberships` – index compositions for grouping related companies

#### Quick start with Docker

```bash
docker compose up -d postgres
cd backend
DATABASE_URL=postgres://sentimark_app:sentimark_app@localhost:5432/sentimark_dev npm run db:reset
```

This will launch PostgreSQL 15 with persistent storage and apply the schema plus demo records.

#### Manual setup

1. Create a PostgreSQL database (for example `sentimark_dev`).
2. Apply the schema and seed data:

   ```bash
   psql postgresql://<user>:<password>@localhost:5432/sentimark_dev -f db/schema.sql
   psql postgresql://<user>:<password>@localhost:5432/sentimark_dev -f db/seed.sql
   ```

3. Configure the connection in `backend/.env`. You can either set a `DATABASE_URL` or individual connection fields (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`). Set `DB_SSL=true` if your provider requires TLS.

> The seed user is `avery@sentimark.ai` with password `Sentimark!2024`. The seed companies cover major tickers across US, EU, and APAC exchanges.

## Development notes

- API stubs can be replaced with live market and authentication providers as the project evolves.
- Axios is used on both client and server for consistent HTTP handling when integrating external APIs.
- Database access is centralised through lightweight repository modules to keep route handlers focused on HTTP concerns. Use `npm run db:migrate`, `npm run db:seed`, or `npm run db:reset` inside `backend/` to manage your local schema.
