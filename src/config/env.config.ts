import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const ENV = {
    PORT: parseInt(process.env.API_KEY_SERVICE_PORT || '3008'),
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT || '5432'),
    DB_USER: process.env.DB_USER || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
    DB_NAME: process.env.DB_NAME || 'neura-agents-platform',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    SERVICE_NAME: 'api-key-service'
};
