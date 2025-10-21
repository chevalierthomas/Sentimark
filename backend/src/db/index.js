import pg from 'pg';

const { Pool } = pg;

function ensureDatabaseConfig() {
  const hasConnectionString = Boolean(process.env.DATABASE_URL);
  const hasIndividualConfig =
    process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER;

  if (!hasConnectionString && !hasIndividualConfig) {
    throw new Error(
      'Database configuration missing. Provide DATABASE_URL or DB_HOST/DB_NAME/DB_USER (see backend/.env.example or backend/.env.development).'
    );
  }
}

function buildPoolConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: parseSslOption(process.env.DB_SSL)
    };
  }

  const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT, 10) : undefined,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: parseSslOption(process.env.DB_SSL)
  };

  return config;
}

function parseSslOption(value) {
  if (!value) {
    return undefined;
  }

  const normalized = value.toString().toLowerCase();
  if (normalized === 'true' || normalized === 'require') {
    return { rejectUnauthorized: false };
  }

  if (normalized === 'verify') {
    return { rejectUnauthorized: true };
  }

  if (normalized === 'false' || normalized === 'disable') {
    return undefined;
  }

  return undefined;
}

ensureDatabaseConfig();

const pool = new Pool(buildPoolConfig());

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL client error', error);
});

export const db = {
  query: (text, params) => pool.query(text, params)
};

export async function initDatabase() {
  const { rows } = await pool.query('select now() as now');
  console.log(`Database connection established at ${rows[0].now}`);
}
