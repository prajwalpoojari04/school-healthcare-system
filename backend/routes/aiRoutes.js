/**
 * backend/routes/aiRoutes.js
 */


const express = require('express');
const router = express.Router();

const {
  getMedicineRecommendation,
  getLatestRecommendation
} = require('../controllers/aiController');

const {
  protect,
  roleCheck
} = require('../middleware/authMiddleware');

// router.post('/recommend', (req, res) => {
//   console.log('AI ROUTE HIT');
//   res.json({ success: true });
// });  

// POST AI Recommendation
router.post(
  '/recommend',
  protect,
  roleCheck('Admin', 'Doctor', 'Nurse'),
  getMedicineRecommendation
);

// GET Latest Recommendation
router.get(
  '/recommendations/:studentId',
  protect,
  roleCheck('Admin', 'Doctor', 'Nurse'),
  getLatestRecommendation
);

module.exports = router;