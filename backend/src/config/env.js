import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '../..');
const nodeEnv = process.env.NODE_ENV ?? 'development';

const envFilesInPriorityOrder = [
  '.env',
  '.env.local',
  `.env.${nodeEnv}`,
  `.env.${nodeEnv}.local`,
  '.env.development'
];

let loadedAtLeastOne = false;

for (const relativePath of envFilesInPriorityOrder) {
  const absolutePath = resolve(projectRoot, relativePath);
  if (!existsSync(absolutePath)) {
    continue;
  }

  const result = dotenv.config({ path: absolutePath, override: false });
  if (!result.error) {
    loadedAtLeastOne = true;
  }
}

if (!loadedAtLeastOne) {
  dotenv.config();
}
