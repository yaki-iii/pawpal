import express, { type Application } from 'express';
import helmet from 'helmet';
import cors, { type CorsOptions } from 'cors';
import path from 'path';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error';
import { apiRoutes } from './routes';

/**
 * Creates and configures the Express application.
 * Registers all middleware (security, CORS, parsing, static files)
 * and mounts API routes under /api/v1.
 */
export function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // CORS configuration — supports multiple origins from CORS_ORIGIN env var
  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., curl, mobile apps, server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      // Check if the request origin is in the allowed list
      if (config.cors.origin.includes(origin)) {
        return callback(null, true);
      }
      logger.warn(`CORS blocked origin: ${origin}`);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  };
  app.use(cors(corsOptions));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static files for uploaded images
  app.use('/api/v1/uploads', express.static(path.resolve(process.cwd(), config.upload.dir)));

  // Health check endpoint
  app.get('/api/v1/health', (_req, res) => {
    res.json({ code: 0, data: { status: 'ok', timestamp: new Date().toISOString() }, message: 'success' });
  });

  // API routes
  app.use('/api/v1', apiRoutes);

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  logger.info('Express app configured with all middleware and routes.');

  return app;
}
