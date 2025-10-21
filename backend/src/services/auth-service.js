import bcrypt from 'bcryptjs';
import { findUserByEmail } from '../repositories/user.repository.js';

export async function authenticateUser(email, password) {
  const userRecord = await findUserByEmail(email);

  if (!userRecord) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, userRecord.passwordHash);
  if (!passwordMatches) {
    return null;
  }

  return {
    id: userRecord.id,
    name: userRecord.name,
    email: userRecord.email,
    roles: userRecord.roles
  };
}
