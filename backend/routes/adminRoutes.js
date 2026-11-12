const express = require('express');
const router = express.Router();

const { requireAuth, requireAdmin } = require('../middleware/auth');
const enquiryController = require('../controllers/enquiryController');
const bookingController = require('../controllers/bookingController');
const contentController = require('../controllers/contentController');
const uploadController = require('../controllers/uploadController');

// All admin routes enforce auth and admin role
router.use(requireAuth, requireAdmin);

// Dashboard & Logs
router.get('/dashboard/stats', contentController.getDashboardStats);
router.get('/activity-logs', contentController.getActivityLogsAdmin);

// Enquiries
router.get('/enquiries', enquiryController.getAllEnquiries);
router.get('/enquiries/:id', enquiryController.getEnquiryById);
router.patch('/enquiries/:id', enquiryController.updateEnquiry);
router.post('/enquiries/:id/convert', enquiryController.convertToBooking);
router.delete('/enquiries/:id', enquiryController.deleteEnquiry);

// Bookings
router.get('/bookings', bookingController.getAllBookings);
router.post('/bookings', bookingController.createBooking);
router.get('/bookings/:id', bookingController.getBookingById);
router.patch('/bookings/:id', bookingController.updateBooking);
router.delete('/bookings/:id', bookingController.deleteBooking);

// Customers
router.get('/customers', contentController.getCustomersAdmin);
router.get('/customers/:id', contentController.getCustomerByIdAdmin);
router.patch('/customers/:id/toggle-status', contentController.toggleCustomerStatusAdmin);

// Services
router.get('/services', contentController.getAllServicesAdmin);
router.post('/services', contentController.createServiceAdmin);
router.patch('/services/:id', contentController.updateServiceAdmin);
router.delete('/services/:id', contentController.deleteServiceAdmin);

// Testimonials
router.get('/testimonials', contentController.getAllTestimonialsAdmin);
router.post('/testimonials', contentController.createTestimonialAdmin);
router.patch('/testimonials/:id', contentController.updateTestimonialAdmin);
router.delete('/testimonials/:id', contentController.deleteTestimonialAdmin);

// Gallery
router.get('/gallery', contentController.getAllGalleryAdmin);
router.post('/gallery', contentController.createGalleryAdmin);
router.patch('/gallery/reorder', contentController.reorderGalleryAdmin);
router.patch('/gallery/:id', contentController.updateGalleryAdmin);
router.delete('/gallery/:id', contentController.deleteGalleryAdmin);

// Hero Carousel
router.get('/hero-carousel', contentController.getAllHeroCarouselAdmin);
router.post('/hero-carousel', contentController.createHeroCarouselAdmin);
router.patch('/hero-carousel/reorder', contentController.reorderHeroCarouselAdmin);
router.patch('/hero-carousel/:id', contentController.updateHeroCarouselAdmin);
router.delete('/hero-carousel/:id', contentController.deleteHeroCarouselAdmin);

// FAQs
router.get('/faqs', contentController.getAllFAQsAdmin);
router.post('/faqs', contentController.createFAQAdmin);
router.patch('/faqs/:id', contentController.updateFAQAdmin);
router.delete('/faqs/:id', contentController.deleteFAQAdmin);

// Settings
router.get('/settings', contentController.getWebsiteSettings);
router.patch('/settings', contentController.updateWebsiteSettings);

// Cloudinary / Uploads
router.get('/uploads/status', uploadController.getUploadStatus);
router.post('/uploads', uploadController.upload.single('image'), uploadController.uploadImage);
router.post('/uploads/multiple', uploadController.upload.array('images', 10), uploadController.uploadMultipleImages);
router.delete('/uploads/:publicId', uploadController.deleteImage);

module.exports = router;

