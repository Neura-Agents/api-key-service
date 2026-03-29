import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import * as apiKeyService from '../services/api-key.service';
import logger from '../config/logger';

export const createApiKey = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { name } = req.body;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        if (!name) return res.status(400).json({ error: 'Name is required' });

        const { apiKey, data } = await apiKeyService.generateApiKey(userId, name);
        
        res.status(201).json({ 
            message: 'API Key created successfully. Please save it as it will not be shown again.',
            apiKey: apiKey,
            data: {
                id: data.id,
                name: data.name,
                key_prefix: data.key_prefix,
                last_four: data.last_four,
                created_at: data.created_at
            }
        });
    } catch (err) {
        logger.error({ err }, 'Failed to create API key');
        res.status(500).json({ error: 'Failed to create API key' });
    }
};

export const listApiKeys = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        const status = req.query.status as string;
        const keys = await apiKeyService.listApiKeys(userId as string, status);
        res.json(keys);
    } catch (err) {
        logger.error({ err }, 'Failed to list API keys');
        res.status(500).json({ error: 'Failed to list API keys' });
    }
};

export const revokeApiKey = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        if (!id) return res.status(400).json({ error: 'API Key ID is required' });
        
        const success = await apiKeyService.revokeApiKey(userId, id as string);
        if (success) {
            res.json({ message: 'API Key revoked successfully' });
        } else {
            res.status(400).json({ error: 'API Key not found, already revoked, or is a Default key which cannot be revoked' });
        }
    } catch (err) {
        logger.error({ err }, 'Failed to revoke API key');
        res.status(500).json({ error: 'Failed to revoke API key' });
    }
};

export const rotateApiKey = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        if (!id) return res.status(400).json({ error: 'API Key ID is required' });
        
        const result = await apiKeyService.rotateApiKey(userId, id as string);
        if (result) {
            res.json({ 
                message: 'API Key rotated successfully. Please save the new key.',
                apiKey: result.apiKey,
                data: result.data
            });
        } else {
            res.status(404).json({ error: 'API Key not found or inactive' });
        }
    } catch (err) {
        logger.error({ err }, 'Failed to rotate API key');
        res.status(500).json({ error: 'Failed to rotate API key' });
    }
};

// Internal endpoint to handle default key for a user
export const getDefaultApiKey = async (req: any, res: Response) => {
    try {
        const userId = (req.params.userId || req.query.userId || req.user?.id) as string;
        if (!userId) return res.status(400).json({ error: 'User ID is required' });

        const keyData = await apiKeyService.getDefaultApiKey(userId);
        if (keyData) {
            res.json({ found: true, data: keyData });
        } else {
            res.json({ found: false, message: 'No default key found' });
        }
    } catch (err) {
        logger.error({ err }, 'Failed to get default API key');
        res.status(500).json({ error: 'Internal Error' });
    }
};

export const createDefaultApiKey = async (req: any, res: Response) => {
    try {
        const userId = req.params.userId as string;
        if (!userId) return res.status(400).json({ error: 'User ID is required' });

        // Check if already exists
        const existing = await apiKeyService.getDefaultApiKey(userId);
        if (existing) {
            return res.json({ message: 'Default key already exists', data: existing });
        }

        const { apiKey, data } = await apiKeyService.generateApiKey(userId, 'Default Key', true);
        res.status(201).json({ 
            message: 'Default API Key created',
            apiKey,
            data
        });
    } catch (err) {
        logger.error({ err }, 'Failed to create default API key');
        res.status(500).json({ error: 'Failed to create default API key' });
    }
};

// Internal validation endpoint for Gateway/Other services
export const validateApiKey = async (req: any, res: Response) => {
    try {
        const apiKey = req.body.apiKey as string;
        if (!apiKey) return res.status(400).json({ error: 'API Key is required' });

        const keyData = await apiKeyService.validateApiKey(apiKey);
        if (keyData) {
            res.json({ 
                valid: true, 
                user: { 
                    id: keyData.user_id,
                    apiKeyId: keyData.id // Include this for downstream tracking
                }, 
                metadata: { rate_limit_rpm: keyData.rate_limit_rpm } 
            });
        } else {
            res.status(401).json({ valid: false, error: 'Invalid or revoked API Key' });
        }
    } catch (err) {
        logger.error({ err }, 'Failed to validate API key');
        res.status(500).json({ error: 'Validation error' });
    }
};
