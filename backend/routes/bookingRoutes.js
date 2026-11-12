const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { requireAuth } = require('../middleware/auth');

router.get('/my', requireAuth, bookingController.getMyBookings);
router.get('/:id', requireAuth, bookingController.getMyBookingById);

module.exports = router;

