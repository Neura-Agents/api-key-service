import { Router } from 'express';
import { 
    createApiKey, 
    listApiKeys, 
    revokeApiKey, 
    validateApiKey, 
    rotateApiKey,
    getDefaultApiKey,
    createDefaultApiKey
} from '../controllers/api-key.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireInternalAuth } from '../middlewares/internal-auth.middleware';

const router = Router();

// Management UI APIs (protected by JWT)
router.post('/', authenticate, createApiKey);
router.get('/', authenticate, listApiKeys);
router.delete('/:id', authenticate, revokeApiKey);
router.post('/:id/rotate', authenticate, rotateApiKey);

// Internal/Management endpoints for Default Key - SECURE: Restricted to internal services
router.get('/default/:userId', requireInternalAuth, getDefaultApiKey);
router.post('/default/:userId', requireInternalAuth, createDefaultApiKey);

// Internal Validation Route - SECURE: Restricted to internal services
router.post('/validate', requireInternalAuth, validateApiKey);

export default router;
