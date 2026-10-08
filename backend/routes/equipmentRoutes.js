import express from 'express';
import { addEquipment, bulkAddEquipment, getEquipments } from '../controllers/equipmentController.js';
import verifyToken, { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Single add — institution only
router.post('/add',      verifyToken, requireRole('institution'), addEquipment);

// Bulk add from Excel — institution only
router.post('/bulk-add', verifyToken, requireRole('institution'), bulkAddEquipment);

// Get all — all authenticated roles
router.get('/', verifyToken, getEquipments);

export default router;
