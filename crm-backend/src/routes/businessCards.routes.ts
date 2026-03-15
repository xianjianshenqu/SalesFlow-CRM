import { Router } from 'express';
import businessCardController from '../controllers/businessCard.controller';
import { authMiddleware } from '../middlewares';
import { validateBody, validateQuery } from '../middlewares/validate';
import { 
  createCustomerFromCardSchema, 
  businessCardQuerySchema 
} from '../validators/businessCard.validator';

const router = Router();

/**
 * @swagger
 * /business-cards/scan:
 *   post:
 *     summary: Upload and scan a business card
 *     tags: [BusinessCards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: URL of the business card image
 *     responses:
 *       201:
 *         description: Business card scanned successfully
 */
router.post(
  '/business-cards/scan',
  authMiddleware,
  businessCardController.uploadAndScan
);

/**
 * @swagger
 * /business-cards/{id}/create-customer:
 *   post:
 *     summary: Create customer and contact from business card
 *     tags: [BusinessCards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - contactName
 *             properties:
 *               name:
 *                 type: string
 *               shortName:
 *                 type: string
 *               industry:
 *                 type: string
 *               city:
 *                 type: string
 *               address:
 *                 type: string
 *               priority:
 *                 type: string
 *               source:
 *                 type: string
 *               notes:
 *                 type: string
 *               contactName:
 *                 type: string
 *               contactTitle:
 *                 type: string
 *               contactDepartment:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *               contactMobile:
 *                 type: string
 *               contactWechat:
 *                 type: string
 *               contactRole:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer created successfully
 */
router.post(
  '/business-cards/:id/create-customer',
  authMiddleware,
  validateBody(createCustomerFromCardSchema),
  businessCardController.createCustomer
);

/**
 * @swagger
 * /business-cards:
 *   get:
 *     summary: Get all business cards
 *     tags: [BusinessCards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processed, failed]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of business cards
 */
router.get(
  '/business-cards',
  authMiddleware,
  validateQuery(businessCardQuerySchema),
  businessCardController.getAll
);

/**
 * @swagger
 * /business-cards/{id}:
 *   get:
 *     summary: Get business card by ID
 *     tags: [BusinessCards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Business card details
 */
router.get('/business-cards/:id', authMiddleware, businessCardController.getById);

/**
 * @swagger
 * /business-cards/{id}:
 *   delete:
 *     summary: Delete business card
 *     tags: [BusinessCards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Business card deleted successfully
 */
router.delete('/business-cards/:id', authMiddleware, businessCardController.delete);

export default router;