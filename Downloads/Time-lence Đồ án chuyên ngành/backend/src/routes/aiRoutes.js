// AI Routes
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

// Priority analysis
router.get('/analyze-priority', aiController.analyzePriority);

// Find free time
router.get('/find-free-time', aiController.findFreeTime);

// Chat AI
router.post('/chat', aiController.chat);

module.exports = router;
