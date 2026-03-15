import { Router } from 'express';
import paymentController from '../controllers/payment.controller';
import { authMiddleware } from '../middlewares';
import { validateBody } from '../middlewares/validate';
import { createPaymentSchema, updatePaymentSchema } from '../validators/payment.validator';

const router = Router();

router.get('/', authMiddleware, paymentController.getAll);
router.get('/stats', authMiddleware, paymentController.getStats);
router.get('/overdue', authMiddleware, paymentController.getOverdue);
router.get('/forecast', authMiddleware, paymentController.getForecast);
router.get('/:id', authMiddleware, paymentController.getById);
router.post('/', authMiddleware, validateBody(createPaymentSchema), paymentController.create);
router.put('/:id', authMiddleware, validateBody(updatePaymentSchema), paymentController.update);
router.delete('/:id', authMiddleware, paymentController.delete);

export default router;