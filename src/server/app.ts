import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config/index.js';
import { requestIdMiddleware } from './middleware/requestId.middleware.js';
import { globalRateLimiter } from './middleware/rateLimiter.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import routes from './routes/index.js';

const app = express();

// Middleware de securite
app.use(helmet());
app.use(cors({
  origin: config.CLIENT_URL,
  credentials: true,
}));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Compression
app.use(compression());

// Logging
if (config.NODE_ENV !== 'test') {
  app.use(morgan('short'));
}

// Request ID
app.use(requestIdMiddleware);

// Rate limiting
app.use('/api', globalRateLimiter);

// Routes
app.use('/api', routes);

// Error handling (doit etre le dernier middleware)
app.use(errorMiddleware);

export default app;
