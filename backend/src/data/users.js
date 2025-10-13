import bcrypt from 'bcryptjs';

const hashedPassword = bcrypt.hashSync('Sentimark!2024', 10);

export const users = [
  {
    id: 'u-001',
    name: 'Avery Analyst',
    email: 'avery@sentimark.ai',
    passwordHash: hashedPassword,
    roles: ['analyst']
  }
];
