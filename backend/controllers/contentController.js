const fs = require('fs');
const path = require('path');
const {
  Service,
  Testimonial,
  Gallery,
  HeroCarousel,
  FAQ,
  WebsiteSettings,
  ActivityLog,
} = require('../models/Content');
const { Enquiry, Booking } = require('../models/Business');
const User = require('../models/User');
const {
  serviceSchema,
  testimonialSchema,
  websiteSettingsSchema,
  gallerySchemaValidator,
  heroCarouselSchemaValidator,
} = require('../validators/schemas');
const { isCloudinaryConfigured, deleteAsset } = require('../config/cloudinary');

// ==================== SERVICES ====================

const getPublicServices = async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ displayOrder: 1, createdAt: 1 });
    res.json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (err) {
    next(err);
  }
};

const getServiceBySlug = async (req, res, next) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug.toLowerCase(), isActive: true });
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
      });
    }
    res.json({
      success: true,
      data: service,
    });
  } catch (err) {
    next(err);
  }
};

const getAllServicesAdmin = async (req, res, next) => {
  try {
    const services = await Service.find().sort({ displayOrder: 1, createdAt: -1 });
    res.json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (err) {
    next(err);
  }
};

const createServiceAdmin = async (req, res, next) => {
  try {
    const validatedData = serviceSchema.parse(req.body);
    const slug = validatedData.slug || validatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await Service.findOne({ slug });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A service with slug '${slug}' already exists.`,
      });
    }

    const service = new Service({
      ...validatedData,
      slug,
    });

    await service.save();

    res.status(201).json({
      success: true,
      message: 'Service created successfully.',
      data: service,
    });
  } catch (err) {
    next(err);
  }
};

const updateServiceAdmin = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
      });
    }

    Object.assign(service, req.body);
    if (req.body.title && !req.body.slug) {
      service.slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    await service.save();

    res.json({
      success: true,
      message: 'Service updated successfully.',
      data: service,
    });
  } catch (err) {
    next(err);
  }
};

const deleteServiceAdmin = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
      });
    }
    res.json({
      success: true,
      message: 'Service deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

// ==================== TESTIMONIALS ====================

const getPublicTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find({ isApproved: true }).sort({ displayOrder: 1, createdAt: -1 });
    res.json({
      success: true,
      count: testimonials.length,
      data: testimonials,
    });
  } catch (err) {
    next(err);
  }
};

const getAllTestimonialsAdmin = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: testimonials.length,
      data: testimonials,
    });
  } catch (err) {
    next(err);
  }
};

const createTestimonialAdmin = async (req, res, next) => {
  try {
    const validatedData = testimonialSchema.parse(req.body);
    const testimonial = new Testimonial(validatedData);
    await testimonial.save();
    res.status(201).json({
      success: true,
      message: 'Testimonial added successfully.',
      data: testimonial,
    });
  } catch (err) {
    next(err);
  }
};

const updateTestimonialAdmin = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    }
    res.json({
      success: true,
      message: 'Testimonial updated successfully.',
      data: testimonial,
    });
  } catch (err) {
    next(err);
  }
};

const deleteTestimonialAdmin = async (req, res, next) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Testimonial deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// ==================== GALLERY ====================

const getPublicGallery = async (req, res, next) => {
  try {
    const filter = {
      $and: [
        { isPublished: { $ne: false } },
        { isActive: { $ne: false } },
      ],
    };

    if (req.query.category && req.query.category !== 'All') {
      filter.$and.push({ category: req.query.category });
    }

    const gallery = await Gallery.find(filter).sort({ displayOrder: 1, createdAt: -1 });
    res.json({ success: true, count: gallery.length, data: gallery });
  } catch (err) {
    next(err);
  }
};

const getAllGalleryAdmin = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }
    if (req.query.status === 'published') {
      filter.isPublished = true;
    } else if (req.query.status === 'draft') {
      filter.isPublished = false;
    }

    const gallery = await Gallery.find(filter).sort({ displayOrder: 1, createdAt: -1 });
    res.json({ success: true, count: gallery.length, data: gallery });
  } catch (err) {
    next(err);
  }
};

const createGalleryAdmin = async (req, res, next) => {
  try {
    const validatedData = gallerySchemaValidator.parse(req.body);
    const isPub = validatedData.isPublished !== undefined ? validatedData.isPublished : true;
    const item = new Gallery({
      ...validatedData,
      isPublished: isPub,
      isActive: isPub,
    });
    await item.save();

    try {
      await ActivityLog.create({
        adminId: req.user?._id,
        adminName: req.user?.name || 'Administrator',
        action: 'CREATE',
        entity: 'Gallery',
        entityId: item._id,
        details: `Created gallery project: ${item.title}`,
      });
    } catch (logErr) {}

    res.status(201).json({ success: true, message: 'Gallery project added successfully.', data: item });
  } catch (err) {
    next(err);
  }
};

const updateGalleryAdmin = async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found.' });
    }

    const validatedData = gallerySchemaValidator.partial().parse(req.body);

    if (validatedData.isPublished !== undefined && validatedData.isActive === undefined) {
      validatedData.isActive = validatedData.isPublished;
    } else if (validatedData.isActive !== undefined && validatedData.isPublished === undefined) {
      validatedData.isPublished = validatedData.isActive;
    }

    Object.assign(item, validatedData);
    await item.save();

    res.json({
      success: true,
      message: 'Gallery project updated successfully.',
      data: item,
    });
  } catch (err) {
    next(err);
  }
};

const deleteGalleryAdmin = async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found.' });
    }

    if (item.publicId) {
      if (item.publicId.startsWith('local_')) {
        const localPath = path.resolve(__dirname, '../../frontend/public/images/gallery', item.publicId.replace('local_', ''));
        if (fs.existsSync(localPath)) {
          try {
            fs.unlinkSync(localPath);
          } catch (e) {
            console.warn('[Gallery] Local image removal warning:', e.message);
          }
        }
      } else if (isCloudinaryConfigured()) {
        try {
          await deleteAsset(item.publicId);
        } catch (cErr) {
          console.warn('[Gallery] Cloudinary asset deletion warning:', cErr.message);
        }
      }
    }

    await Gallery.findByIdAndDelete(req.params.id);

    try {
      await ActivityLog.create({
        adminId: req.user?._id,
        adminName: req.user?.name || 'Administrator',
        action: 'DELETE',
        entity: 'Gallery',
        entityId: item._id,
        details: `Deleted gallery project: ${item.title}`,
      });
    } catch (logErr) {}

    res.json({ success: true, message: 'Gallery project and associated image removed successfully.' });
  } catch (err) {
    next(err);
  }
};

const reorderGalleryAdmin = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array is required for reordering.' });
    }

    const updateOps = items.map((it) => ({
      updateOne: {
        filter: { _id: it.id },
        update: { $set: { displayOrder: it.displayOrder } },
      },
    }));

    if (updateOps.length > 0) {
      await Gallery.bulkWrite(updateOps);
    }

    res.json({ success: true, message: 'Gallery display order updated successfully.' });
  } catch (err) {
    next(err);
  }
};

// ==================== HERO CAROUSEL ====================

const getPublicHeroCarousel = async (req, res, next) => {
  try {
    const slides = await HeroCarousel.find({
      $and: [
        { isPublished: { $ne: false } },
        { isActive: { $ne: false } },
      ],
    }).sort({ displayOrder: 1, createdAt: -1 });

    res.json({
      success: true,
      count: slides.length,
      data: slides,
    });
  } catch (err) {
    next(err);
  }
};

const getAllHeroCarouselAdmin = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status === 'published') {
      filter.isPublished = true;
    } else if (req.query.status === 'draft') {
      filter.isPublished = false;
    }
    if (req.query.active === 'true') {
      filter.isActive = true;
    } else if (req.query.active === 'false') {
      filter.isActive = false;
    }

    const slides = await HeroCarousel.find(filter).sort({ displayOrder: 1, createdAt: -1 });
    res.json({
      success: true,
      count: slides.length,
      data: slides,
    });
  } catch (err) {
    next(err);
  }
};

const createHeroCarouselAdmin = async (req, res, next) => {
  try {
    const validatedData = heroCarouselSchemaValidator.parse(req.body);
    const slide = new HeroCarousel({
      ...validatedData,
      isActive: validatedData.isActive !== undefined ? validatedData.isActive : true,
      isPublished: validatedData.isPublished !== undefined ? validatedData.isPublished : true,
    });
    await slide.save();

    try {
      await ActivityLog.create({
        adminId: req.user?._id,
        adminName: req.user?.name || 'Administrator',
        action: 'CREATE',
        entity: 'HeroCarousel',
        entityId: slide._id,
        details: `Created hero carousel slide: ${slide.title || slide.imageUrl}`,
      });
    } catch (logErr) {}

    res.status(201).json({
      success: true,
      message: 'Hero carousel slide created successfully.',
      data: slide,
    });
  } catch (err) {
    next(err);
  }
};

const updateHeroCarouselAdmin = async (req, res, next) => {
  try {
    const slide = await HeroCarousel.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ success: false, message: 'Hero carousel slide not found.' });
    }

    const validatedData = heroCarouselSchemaValidator.partial().parse(req.body);
    Object.assign(slide, validatedData);
    await slide.save();

    res.json({
      success: true,
      message: 'Hero carousel slide updated successfully.',
      data: slide,
    });
  } catch (err) {
    next(err);
  }
};

const reorderHeroCarouselAdmin = async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array is required for reordering.' });
    }

    const updateOps = items.map((it) => ({
      updateOne: {
        filter: { _id: it.id },
        update: { $set: { displayOrder: it.displayOrder } },
      },
    }));

    if (updateOps.length > 0) {
      await HeroCarousel.bulkWrite(updateOps);
    }

    res.json({ success: true, message: 'Hero carousel order updated successfully.' });
  } catch (err) {
    next(err);
  }
};

const deleteHeroCarouselAdmin = async (req, res, next) => {
  try {
    const slide = await HeroCarousel.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ success: false, message: 'Hero carousel slide not found.' });
    }

    // Delete asset from local disk or Cloudinary
    if (slide.publicId) {
      if (slide.publicId.startsWith('local_')) {
        const localFilename = slide.publicId.replace('local_', '');
        const candidatePaths = [
          path.resolve(__dirname, '../../frontend/public/images/hero', localFilename),
          path.resolve(__dirname, '../../frontend/public/images/gallery', localFilename),
        ];
        for (const p of candidatePaths) {
          if (fs.existsSync(p)) {
            try { fs.unlinkSync(p); } catch (e) {}
          }
        }
      } else if (isCloudinaryConfigured()) {
        try {
          await deleteAsset(slide.publicId);
        } catch (cErr) {
          console.warn('[HeroCarousel] Cloudinary asset deletion warning:', cErr.message);
        }
      }
    }

    await HeroCarousel.findByIdAndDelete(req.params.id);

    try {
      await ActivityLog.create({
        adminId: req.user?._id,
        adminName: req.user?.name || 'Administrator',
        action: 'DELETE',
        entity: 'HeroCarousel',
        entityId: slide._id,
        details: `Deleted hero carousel slide: ${slide.title || slide.imageUrl}`,
      });
    } catch (logErr) {}

    res.json({ success: true, message: 'Hero carousel slide and image removed successfully.' });
  } catch (err) {
    next(err);
  }
};

// ==================== FAQS ====================

const getPublicFAQs = async (req, res, next) => {
  try {
    const faqs = await FAQ.find({ isActive: true }).sort({ displayOrder: 1, createdAt: 1 });
    res.json({ success: true, count: faqs.length, data: faqs });
  } catch (err) {
    next(err);
  }
};

const getAllFAQsAdmin = async (req, res, next) => {
  try {
    const faqs = await FAQ.find().sort({ displayOrder: 1, createdAt: 1 });
    res.json({ success: true, count: faqs.length, data: faqs });
  } catch (err) {
    next(err);
  }
};

const createFAQAdmin = async (req, res, next) => {
  try {
    const { question, answer, category, displayOrder } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, message: 'Question and answer are required.' });
    }
    const faq = new FAQ({ question, answer, category, displayOrder });
    await faq.save();
    res.status(201).json({ success: true, message: 'FAQ created successfully.', data: faq });
  } catch (err) {
    next(err);
  }
};

const updateFAQAdmin = async (req, res, next) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found.' });
    res.json({ success: true, message: 'FAQ updated successfully.', data: faq });
  } catch (err) {
    next(err);
  }
};

const deleteFAQAdmin = async (req, res, next) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'FAQ deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// ==================== WEBSITE SETTINGS ====================

const getWebsiteSettings = async (req, res, next) => {
  try {
    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      settings = await WebsiteSettings.create({
        companyName: 'History Packers & Movers',
        phone1: '+91 9251273070',
        phone2: '+91 6375273070',
        email: 'Historypackersandmovers@gmail.com',
        address: 'SHOP NO 05 BASEMENT PLOT NO R 3/42, INDRAPRASTH COLONY CHORDIYA CITY DHAWAS, JAIPUR, RAJASTHAN, INDIA.',
      });
    }
    res.json({
      success: true,
      data: settings,
    });
  } catch (err) {
    next(err);
  }
};

const updateWebsiteSettings = async (req, res, next) => {
  try {
    const validatedData = websiteSettingsSchema.parse(req.body);
    let settings = await WebsiteSettings.findOne();
    if (!settings) {
      settings = new WebsiteSettings(validatedData);
    } else {
      Object.assign(settings, validatedData);
    }
    await settings.save();

    await ActivityLog.create({
      userId: req.user?._id,
      userName: req.user?.name || 'Admin',
      action: 'WEBSITE_SETTINGS_UPDATED',
      targetType: 'Settings',
    }).catch(() => {});

    res.json({
      success: true,
      message: 'Website settings updated successfully.',
      data: settings,
    });
  } catch (err) {
    next(err);
  }
};

// ==================== ADMIN DASHBOARD STATS ====================

const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalCustomers,
      totalEnquiries,
      pendingEnquiries,
      totalBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      recentEnquiries,
      recentBookings,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Enquiry.countDocuments({ isArchived: false }),
      Enquiry.countDocuments({ status: { $in: ['New', 'Contacted', 'Negotiation'] }, isArchived: false }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ['Confirmed', 'Packing', 'In Transit', 'Out for Delivery'] } }),
      Booking.countDocuments({ status: 'Delivered' }),
      Booking.countDocuments({ status: 'Cancelled' }),
      Enquiry.find({ isArchived: false }).sort({ createdAt: -1 }).limit(5),
      Booking.find().sort({ createdAt: -1 }).limit(5),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalCustomers,
          totalEnquiries,
          pendingEnquiries,
          totalBookings,
          confirmedBookings,
          completedBookings,
          cancelledBookings,
        },
        recentEnquiries,
        recentBookings,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ==================== CUSTOMER MANAGEMENT (ADMIN) ====================

const getCustomersAdmin = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const query = { role: 'customer' };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { mobile: searchRegex }];
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNumber - 1) * limitNumber;

    const [customers, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNumber),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber) || 1,
      count: customers.length,
      data: customers,
    });
  } catch (err) {
    next(err);
  }
};

const getCustomerByIdAdmin = async (req, res, next) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: 'customer' });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const [enquiries, bookings] = await Promise.all([
      Enquiry.find({
        $or: [{ customerId: customer._id }, { email: customer.email }, { mobile: customer.mobile }],
      }).sort({ createdAt: -1 }),
      Booking.find({
        $or: [{ customerId: customer._id }, { customerEmail: customer.email }, { customerMobile: customer.mobile }],
      }).sort({ createdAt: -1 }),
    ]);

    res.json({
      success: true,
      data: {
        customer,
        enquiries,
        bookings,
      },
    });
  } catch (err) {
    next(err);
  }
};

const toggleCustomerStatusAdmin = async (req, res, next) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: 'customer' });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    customer.status = customer.status === 'active' ? 'inactive' : 'active';
    if (customer.status === 'inactive') {
      customer.refreshTokens = []; // Revoke active sessions
    }
    await customer.save();

    await ActivityLog.create({
      userId: req.user?._id,
      userName: req.user?.name || 'Admin',
      action: 'CUSTOMER_STATUS_CHANGED',
      targetType: 'User',
      targetId: customer._id.toString(),
      details: { newStatus: customer.status },
    }).catch(() => {});

    res.json({
      success: true,
      message: `Customer account is now ${customer.status}.`,
      data: customer,
    });
  } catch (err) {
    next(err);
  }
};

const getActivityLogsAdmin = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicServices,
  getServiceBySlug,
  getAllServicesAdmin,
  createServiceAdmin,
  updateServiceAdmin,
  deleteServiceAdmin,
  getPublicTestimonials,
  getAllTestimonialsAdmin,
  createTestimonialAdmin,
  updateTestimonialAdmin,
  deleteTestimonialAdmin,
  getPublicGallery,
  getAllGalleryAdmin,
  createGalleryAdmin,
  updateGalleryAdmin,
  deleteGalleryAdmin,
  reorderGalleryAdmin,
  getPublicHeroCarousel,
  getAllHeroCarouselAdmin,
  createHeroCarouselAdmin,
  updateHeroCarouselAdmin,
  deleteHeroCarouselAdmin,
  reorderHeroCarouselAdmin,
  getPublicFAQs,
  getAllFAQsAdmin,
  createFAQAdmin,
  updateFAQAdmin,
  deleteFAQAdmin,
  getWebsiteSettings,
  updateWebsiteSettings,
  getDashboardStats,
  getCustomersAdmin,
  getCustomerByIdAdmin,
  toggleCustomerStatusAdmin,
  getActivityLogsAdmin,
};

