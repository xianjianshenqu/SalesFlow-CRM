import { Router } from 'express';
import authRoutes from './auth.routes';
import customerRoutes from './customers.routes';
import opportunityRoutes from './opportunities.routes';
import paymentRoutes from './payments.routes';
import recordingRoutes from './recordings.routes';
import scheduleRoutes from './schedules.routes';
import proposalRoutes from './proposals.routes';
import teamRoutes from './team.routes';
import serviceRoutes from './services.routes';
import presalesRoutes from './presales.routes';
import presalesActivityRoutes from './presalesActivity.routes';
import mapRoutes from './map.routes';
import dashboardRoutes from './dashboard.routes';
import contactRoutes from './contacts.routes';
import businessCardRoutes from './businessCards.routes';
import coldVisitRoutes from './coldVisit.routes';
import aiRoutes from './ai.routes';
import performanceRoutes from './performance.routes';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Business routes
router.use('/customers', customerRoutes);
router.use('/opportunities', opportunityRoutes);
router.use('/payments', paymentRoutes);
router.use('/recordings', recordingRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/proposals', proposalRoutes);
router.use('/team', teamRoutes);
router.use('/services', serviceRoutes);
router.use('/presales', presalesRoutes);
router.use('/presales', presalesActivityRoutes);  // Presales activity management routes
router.use('/map', mapRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/', contactRoutes);  // Contact routes include both /customers/:id/contacts and /contacts/:id
router.use('/', businessCardRoutes);  // Business card routes
router.use('/cold-visit', coldVisitRoutes);  // Cold visit AI assistant routes
router.use('/ai', aiRoutes);  // AI feature routes
router.use('/performance', performanceRoutes);  // Sales performance routes

export default router;