import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import itemsRoutes from './routes/items.routes';
import auditRoutes from './routes/audit.routes';
import transactionsRoutes from './routes/transactions.routes';
import opnameRoutes from './routes/opname.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: '🚀 Inventori API Server (Kompatibel dengan Rust CLI App)',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      items: '/api/items',
      audit: '/api/audit',
      transactions: '/api/transactions',
      opname: '/api/opname',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/opname', opnameRoutes);

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: Function) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Terjadi kesalahan server' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});

export default app;
