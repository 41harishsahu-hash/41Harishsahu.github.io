const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

// Public Service Endpoints
router.get('/services', contentController.getPublicServices);
router.get('/services/:slug', contentController.getServiceBySlug);

// Public Testimonials, Gallery, Hero Carousel, FAQ, Settings
router.get('/testimonials', contentController.getPublicTestimonials);
router.get('/gallery', contentController.getPublicGallery);
router.get('/hero-carousel', contentController.getPublicHeroCarousel);
router.get('/faqs', contentController.getPublicFAQs);
router.get('/settings', contentController.getWebsiteSettings);

module.exports = router;

