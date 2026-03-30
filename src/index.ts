import express from 'express';
import { ENV } from './config/env.config';
import { initDb } from './config/db.config';
import logger from './config/logger';

import apiKeyRoutes from './routes/api-key.routes';

const app = express();

// Middleware
app.use(express.json());

// Log requests
app.use((req, res, next) => {
    logger.info({ 
        method: req.method, 
        url: req.url,
        ip: req.ip 
    }, 'Incoming Request');
    next();
});

// Routes
app.use('/backend/api/api-keys', apiKeyRoutes);

// Internal Validation Route (Not exposed through Kong gateway or protected by other means)
// It can be also under /backend/api/api-keys/internal if needed
// app.use('/internal/api-keys', internalApiKeyRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'api-key-service', version: '1.0.0' });
});

// Error Handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error({ err, url: req.url }, 'API Key Service: Unhandled error occurred');
    res.status(500).json({ error: 'Internal Server Error' });
});

const start = async () => {
    try {
        await initDb();
        
        app.listen(ENV.PORT, () => {
            logger.info(`API Key service listening on port ${ENV.PORT} in ${ENV.NODE_ENV} mode`);
        });
    } catch (err) {
        logger.fatal({ err }, 'Failed to start api-key-service');
        process.exit(1);
    }
};

start();
