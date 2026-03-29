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

const router = Router();

// Management UI APIs (protected by JWT)
router.post('/', authenticate, createApiKey);
router.get('/', authenticate, listApiKeys);
router.delete('/:id', authenticate, revokeApiKey);
router.post('/:id/rotate', authenticate, rotateApiKey);

// Internal/Management endpoints for Default Key
router.get('/default/:userId', getDefaultApiKey);
router.post('/default/:userId', createDefaultApiKey);

// Internal Validation Route
router.post('/validate', validateApiKey);

export default router;
