import './config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRouter from './routes/auth.js';
import companiesRouter from './routes/companies.js';
import { errorHandler } from './middleware/error-handler.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './docs/swagger.js';
import { initDatabase } from './db/index.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
    credentials: true
  })
);
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api/docs.json', (req, res) => {
  res.json(swaggerDocument);
});

await initDatabase().catch((error) => {
  console.error('Failed to connect to the database', error);
  process.exit(1);
});

app.use('/api/auth', authRouter);
app.use('/api/companies', companiesRouter);

app.use(errorHandler);

const port = process.env.PORT ?? 4000;
app.listen(port, () => {
  console.log(`Sentimark backend listening on http://localhost:${port}`);
});
