import { Router } from 'express';
import contactController from '../controllers/contact.controller';
import { authMiddleware } from '../middlewares';
import { validateBody, validateQuery } from '../middlewares/validate';
import { 
  createContactSchema, 
  updateContactSchema, 
  contactQuerySchema,
  batchImportContactsSchema 
} from '../validators/contact.validator';

const router = Router();

/**
 * @swagger
 * /customers/{customerId}/contacts:
 *   get:
 *     summary: Get all contacts for a customer
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [decision_maker, key_influencer, coach, end_user, gatekeeper, blocker]
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *       - in: query
 *         name: isPrimary
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of contacts
 */
router.get(
  '/customers/:customerId/contacts',
  authMiddleware,
  validateQuery(contactQuerySchema),
  contactController.getByCustomer
);

/**
 * @swagger
 * /contacts/{id}:
 *   get:
 *     summary: Get contact by ID
 *     tags: [Contacts]
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
 *         description: Contact details
 */
router.get('/contacts/:id', authMiddleware, contactController.getById);

/**
 * @swagger
 * /customers/{customerId}/contacts:
 *   post:
 *     summary: Create a new contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
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
 *             properties:
 *               name:
 *                 type: string
 *               title:
 *                 type: string
 *               department:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               mobile:
 *                 type: string
 *               wechat:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [decision_maker, key_influencer, coach, end_user, gatekeeper, blocker]
 *               isPrimary:
 *                 type: boolean
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contact created successfully
 */
router.post(
  '/customers/:customerId/contacts',
  authMiddleware,
  validateBody(createContactSchema),
  contactController.create
);

/**
 * @swagger
 * /contacts/{id}:
 *   put:
 *     summary: Update contact
 *     tags: [Contacts]
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
 *         description: Contact updated successfully
 */
router.put(
  '/contacts/:id',
  authMiddleware,
  validateBody(updateContactSchema),
  contactController.update
);

/**
 * @swagger
 * /contacts/{id}:
 *   delete:
 *     summary: Delete contact
 *     tags: [Contacts]
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
 *         description: Contact deleted successfully
 */
router.delete('/contacts/:id', authMiddleware, contactController.delete);

/**
 * @swagger
 * /contacts/{id}/primary:
 *   patch:
 *     summary: Set contact as primary
 *     tags: [Contacts]
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
 *         description: Primary contact updated
 */
router.patch('/contacts/:id/primary', authMiddleware, contactController.setPrimary);

/**
 * @swagger
 * /customers/{customerId}/contacts/batch:
 *   post:
 *     summary: Batch import contacts
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
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
 *               - contacts
 *             properties:
 *               contacts:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Contacts imported successfully
 */
router.post(
  '/customers/:customerId/contacts/batch',
  authMiddleware,
  validateBody(batchImportContactsSchema),
  contactController.batchImport
);

/**
 * @swagger
 * /contacts/stats:
 *   get:
 *     summary: Get contact statistics
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact statistics
 */
router.get('/contacts/stats', authMiddleware, contactController.getStats);

/**
 * @swagger
 * /customers/{customerId}/contacts/by-department:
 *   get:
 *     summary: Get contacts grouped by department
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contacts grouped by department
 */
router.get(
  '/customers/:customerId/contacts/by-department',
  authMiddleware,
  contactController.getByDepartment
);

export default router;