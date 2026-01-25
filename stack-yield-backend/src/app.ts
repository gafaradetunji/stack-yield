import express from 'express';
import depositsRoutes from './api/deposits.routes.ts';
import withdrawalsRoutes from './api/withdrawals.routes.ts';

export const app = express();

// Fix BigInt serialization
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/deposits', depositsRoutes);
app.use('/withdrawals', withdrawalsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;
