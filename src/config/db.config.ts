import { Pool } from 'pg';
import { ENV } from './env.config';
import logger from './logger';

const pool = new Pool({
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    user: ENV.DB_USER,
    password: ENV.DB_PASSWORD,
    database: ENV.DB_NAME,
    options: `-c search_path=${ENV.DB_SCHEMA},public`,
});

export const initDb = async () => {
    try {
        const client = await pool.connect();
        logger.info('Connected to PostgreSQL database');

        // Initialize tables
        await client.query(`
            CREATE TABLE IF NOT EXISTS api_keys (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                api_key_hash TEXT UNIQUE NOT NULL,
                key_prefix TEXT NOT NULL,
                last_four TEXT NOT NULL,
                status TEXT DEFAULT 'active',
                is_default BOOLEAN DEFAULT FALSE,
                rate_limit_rpm INTEGER DEFAULT 60,
                usage_count BIGINT DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP WITH TIME ZONE
            );
        `);

        // Migration: Add is_default if it doesn't exist
        try {
            await client.query(`ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE`);
        } catch (e) {
            // Column may already exist
        }

        client.release();
        logger.info('API Key service table initialization completed');
    } catch (err) {
        logger.error({ err }, 'Failed to initialize database');
        throw err;
    }
};

export const query = (text: string, params?: any[]) => pool.query(text, params);
