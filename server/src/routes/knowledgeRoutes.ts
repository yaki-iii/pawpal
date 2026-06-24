import { Router } from 'express';
import { KnowledgeController } from '../controllers/knowledgeController';

const router = Router();

// All knowledge routes are public (no auth required)
router.get('/', KnowledgeController.list);
router.get('/categories', KnowledgeController.getCategories);
router.get('/search', KnowledgeController.search);
router.get('/:id', KnowledgeController.getById);

export default router;
