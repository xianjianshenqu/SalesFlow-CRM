import { Router } from 'express';
import customerController from '../controllers/customer.controller';
import { authMiddleware } from '../middlewares';
import { validateBody, validateQuery } from '../middlewares/validate';
import { createCustomerSchema, updateCustomerSchema, customerQuerySchema } from '../validators/customer.validator';

const router = Router();

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *       - in: query
 *         name: stage
 *         schema:
 *           type: string
 *           enum: [new_lead, contacted, solution, negotiation, won, all]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [high, medium, low]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of customers
 */
router.get('/', authMiddleware, validateQuery(customerQuerySchema), customerController.getAll);

/**
 * @swagger
 * /customers/stats:
 *   get:
 *     summary: Get customer statistics
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer statistics
 */
router.get('/stats', authMiddleware, customerController.getStats);

/**
 * @swagger
 * /customers/distribution:
 *   get:
 *     summary: Get customer distribution by city, industry, source
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer distribution
 */
router.get('/distribution', authMiddleware, customerController.getDistribution);

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
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
 *         description: Customer details
 */
router.get('/:id', authMiddleware, customerController.getById);

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - shortName
 *               - contactPerson
 *             properties:
 *               name:
 *                 type: string
 *               shortName:
 *                 type: string
 *               email:
 *                 type: string
 *               stage:
 *                 type: string
 *               estimatedValue:
 *                 type: number
 *               priority:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               phone:
 *                 type: string
 *               city:
 *                 type: string
 *               industry:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer created successfully
 */
router.post('/', authMiddleware, validateBody(createCustomerSchema), customerController.create);

/**
 * @swagger
 * /customers/{id}:
 *   put:
 *     summary: Update customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Customer updated successfully
 */
router.put('/:id', authMiddleware, validateBody(updateCustomerSchema), customerController.update);

/**
 * @swagger
 * /customers/{id}:
 *   delete:
 *     summary: Delete customer
 *     tags: [Customers]
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
 *         description: Customer deleted successfully
 */
router.delete('/:id', authMiddleware, customerController.delete);

export default router;