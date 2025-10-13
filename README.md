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

The welcome screen showcases a market search bar with keyboard-friendly autocompletion and a
secure login form. Axios is configured with an interceptor to safely communicate with the
backend.

### Getting started

```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file based on `.env.example` if you need to override the default API URL.

## Backend (Node.js + Express)

The backend exposes:

- `GET /api/markets` – search endpoint with server-side filtering
- `POST /api/auth/login` – credential check returning short-lived JWTs

Security middleware such as Helmet, CORS, and request logging with Morgan are pre-configured.

### Getting started

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Update the `JWT_SECRET` value in `.env` before running in production.

## Development notes

- The demo user uses the email `avery@sentimark.ai` with password `Sentimark!2024`.
- API stubs can be replaced with live market and authentication providers as the project evolves.
- Axios is used on both client and server for consistent HTTP handling when integrating external APIs.
