import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env.config';
import logger from '../config/logger';

/**
 * Middleware to restrict access to internal microservices only.
 * Checks for a shared secret in the 'x-internal-key' header.
 */
export const requireInternalAuth = (req: Request, res: Response, next: NextFunction) => {
    const internalKey = req.headers['x-internal-key'];

    if (!internalKey || internalKey !== ENV.INTERNAL_SERVICE_SECRET) {
        logger.warn({ 
            method: req.method, 
            url: req.url, 
            ip: req.ip 
        }, 'Unauthorized internal service access attempted');
        
        return res.status(403).json({ 
            error: 'Forbidden: This is an internal management endpoint.' 
        });
    }

    next();
};
