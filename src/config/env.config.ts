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
    LOG: {
        LEVEL: process.env.LOG_LEVEL || 'info',
    },
    INTERNAL_SERVICE_SECRET: process.env.INTERNAL_SERVICE_SECRET || 'dev-secret',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    SERVICE_NAME: 'api-key-service',
    KEYCLOAK: {
        ISSUER_URL: process.env.KEYCLOAK_ISSUER_URL || 'http://keycloak:8080/realms/neura-agents',
        PUBLIC_ISSUER_URL: process.env.KEYCLOAK_PUBLIC_ISSUER_URL || 'http://localhost:8081/realms/neura-agents',
        REALM: process.env.VITE_KEYCLOAK_REALM || 'neura-agents'
    }
};
