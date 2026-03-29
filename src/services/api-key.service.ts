import crypto from 'crypto';
import { nanoid } from 'nanoid';
import * as db from '../config/db.config';
import logger from '../config/logger';

export interface ApiKey {
    id: string;
    user_id: string;
    name: string;
    api_key_hash: string;
    key_prefix: string;
    last_four: string;
    status: 'active' | 'revoked';
    is_default: boolean;
    rate_limit_rpm: number;
    usage_count: number;
    created_at: Date;
    expires_at?: Date;
}

export const generateApiKey = async (userId: string, name: string, isDefault: boolean = false): Promise<{ apiKey: string; data: ApiKey }> => {
    const rawKey = `sk_${crypto.randomBytes(24).toString('hex')}`; // 24 bytes => 48 hex chars + prefix
    const apiKeyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = 'sk_';
    const lastFour = rawKey.slice(-4);
    
    const res = await db.query(
        `INSERT INTO api_keys (user_id, name, api_key_hash, key_prefix, last_four, is_default)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, name, apiKeyHash, keyPrefix, lastFour, isDefault]
    );
    
    return { apiKey: rawKey, data: res.rows[0] };
};

export const listApiKeys = async (userId: string, status?: string): Promise<ApiKey[]> => {
    let query = `SELECT id, user_id, name, key_prefix, last_four, status, is_default, rate_limit_rpm, usage_count, created_at, expires_at 
                 FROM api_keys WHERE user_id = $1 AND status != 'deleted'`;
    const params: any[] = [userId];

    if (status) {
        params.push(status);
        query += ` AND status = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    const res = await db.query(query, params);
    return res.rows;
};

export const revokeApiKey = async (userId: string, id: string, force: boolean = false): Promise<boolean> => {
    // Prevent revoking default keys unless forcing (e.g. for rotation)
    const query = force 
        ? `UPDATE api_keys SET status = 'revoked', updated_at = CURRENT_TIMESTAMP 
           WHERE id = $1 AND user_id = $2 AND status = 'active' RETURNING id`
        : `UPDATE api_keys SET status = 'revoked', updated_at = CURRENT_TIMESTAMP 
           WHERE id = $1 AND user_id = $2 AND status = 'active' AND is_default = FALSE RETURNING id`;
           
    const res = await db.query(query, [id, userId]);
    return res.rowCount ? res.rowCount > 0 : false;
};

export const rotateApiKey = async (userId: string, id: string): Promise<{ apiKey: string; data: ApiKey } | null> => {
    // 1. Get the current key to see its name and default status
    const resOld = await db.query(
        `SELECT name, is_default FROM api_keys WHERE id = $1 AND user_id = $2 AND status = 'active'`,
        [id, userId]
    );
    
    if (resOld.rows.length === 0) return null;
    const oldKeyInfo = resOld.rows[0];
    
    // 2. Revoke the old key (force since it might be default)
    await revokeApiKey(userId, id, true);
    
    // 3. Generate a new key with same name and default status
    return generateApiKey(userId, oldKeyInfo.name, oldKeyInfo.is_default);
};

export const getDefaultApiKey = async (userId: string): Promise<ApiKey | null> => {
    const res = await db.query(
        `SELECT * FROM api_keys WHERE user_id = $1 AND is_default = TRUE AND status = 'active' LIMIT 1`,
        [userId]
    );
    return res.rows[0] || null;
};

export const validateApiKey = async (key: string): Promise<ApiKey | null> => {
    const hash = crypto.createHash('sha256').update(key).digest('hex');
    const res = await db.query(
        `SELECT * FROM api_keys WHERE api_key_hash = $1 AND status = 'active'`,
        [hash]
    );
    
    if (res.rows.length === 0) return null;
    
    const apiKey = res.rows[0];
    
    // Check expiration
    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
        await db.query(`UPDATE api_keys SET status = 'expired' WHERE id = $1`, [apiKey.id]);
        return null;
    }
    
    return apiKey;
};

