import { db } from '../db/index.js';

export async function findUserByEmail(email) {
  const normalizedEmail = email.toLowerCase();
  const { rows } = await db.query(
    `
      select
        id,
        name,
        email,
        password_hash as "passwordHash",
        roles
      from users
      where lower(email) = $1
      limit 1
    `,
    [normalizedEmail]
  );

  return rows[0] ?? null;
}
