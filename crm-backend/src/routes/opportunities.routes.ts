import { Router } from 'express';
import opportunityController from '../controllers/opportunity.controller';
import { authMiddleware } from '../middlewares';
import { validateBody } from '../middlewares/validate';
import { createOpportunitySchema, updateOpportunitySchema, moveStageSchema } from '../validators/opportunity.validator';

const router = Router();

router.get('/', authMiddleware, opportunityController.getAll);
router.get('/stats', authMiddleware, opportunityController.getStats);
router.get('/:id', authMiddleware, opportunityController.getById);
router.post('/', authMiddleware, validateBody(createOpportunitySchema), opportunityController.create);
router.put('/:id', authMiddleware, validateBody(updateOpportunitySchema), opportunityController.update);
router.delete('/:id', authMiddleware, opportunityController.delete);
router.patch('/:id/stage', authMiddleware, validateBody(moveStageSchema), opportunityController.moveStage);

export default router;