import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './src/config/db.js';

// Import Routes
import batchRoutes from './src/routes/batch.routes.js';
import recordRoutes from './src/routes/record.routes.js';
import templateRoutes from './src/routes/template.routes.js';
import statsRoutes from './src/routes/stats.routes.js';
import rangeBatchRoutes from './src/routes/rangeBatch.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '20mb' })); // Support base64 image scan uploads
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static Assets
app.use('/storage', express.static(path.resolve(__dirname, 'storage')));
app.use('/assets', express.static(path.resolve(__dirname, 'src/assets')));

// API Routes
app.use('/api/batches', batchRoutes);
app.use('/api/range-batches', rangeBatchRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'Vidhyut Saathi Barcode Generator & PDF Sheet Management System',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server & Connect Database
function startServer() {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` VIDHYUT SAATHI BARCODE ENGINE RUNNING ON PORT ${PORT}`);
    console.log(` API Endpoint: http://localhost:${PORT}/api/health`);
    console.log(` Static Storage: http://localhost:${PORT}/storage/`);
    console.log(`=======================================================`);
  });

  // Connect to DB asynchronously without blocking server readiness
  connectDB().catch((err) => {
    console.warn('Initial DB connection issue:', err.message);
  });
}

startServer();
