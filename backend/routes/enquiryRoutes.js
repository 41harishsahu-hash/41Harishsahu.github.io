const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { enquiryLimiter } = require('../middleware/rateLimiter');

router.post('/', enquiryLimiter, optionalAuth, enquiryController.createEnquiry);
router.get('/my', requireAuth, enquiryController.getMyEnquiries);

module.exports = router;

