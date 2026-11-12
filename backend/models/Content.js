const mongoose = require('mongoose');

// SERVICE SCHEMA
const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    fullDescription: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: 'Truck',
    },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    benefits: [
      {
        type: String,
        trim: true,
      },
    ],
    processSteps: [
      {
        stepNumber: Number,
        title: String,
        description: String,
      },
    ],
    faqs: [
      {
        question: String,
        answer: String,
      },
    ],
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// TESTIMONIAL SCHEMA
const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    location: {
      type: String,
      trim: true,
      default: 'Jaipur',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    serviceUsed: {
      type: String,
      default: 'Home Relocation',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    isApproved: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// GALLERY SCHEMA
const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: 120,
    },
    category: {
      type: String,
      default: 'Household Shifting',
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    projectDate: {
      type: Date,
      default: Date.now,
    },
    location: {
      type: String,
      default: 'Jaipur',
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    publicId: {
      type: String,
      default: '',
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// HERO CAROUSEL SCHEMA
const heroCarouselSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    publicId: {
      type: String,
      default: '',
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// FAQ SCHEMA
const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// WEBSITE SETTINGS SCHEMA
const websiteSettingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      default: 'History Packers & Movers',
    },
    tagline: {
      type: String,
      default: 'Safe Fast Reliable',
    },
    phone1: {
      type: String,
      default: '+91 9251273070',
    },
    phone2: {
      type: String,
      default: '+91 6375273070',
    },
    email: {
      type: String,
      default: 'Historypackersandmovers@gmail.com',
    },
    address: {
      type: String,
      default: 'SHOP NO 05 BASEMENT PLOT NO R 3/42, INDRAPRASTH COLONY CHORDIYA CITY DHAWAS, JAIPUR, RAJASTHAN, INDIA.',
    },
    city: {
      type: String,
      default: 'Jaipur',
    },
    state: {
      type: String,
      default: 'Rajasthan',
    },
    country: {
      type: String,
      default: 'India',
    },
    whatsappNumber: {
      type: String,
      default: '+91 9251273070',
    },
    heroHeadline: {
      type: String,
      default: 'Moving Made Simple. Moving Made Safe.',
    },
    heroSubtext: {
      type: String,
      default: 'Reliable packing and moving solutions for your home, office and vehicle. Experience safe handling, professional packing and dependable transportation.',
    },
    aboutStory: {
      type: String,
      default: 'History Packers & Movers is committed to delivering stress-free shifting experiences across Jaipur and all over India with careful packing, professional handling, and on-time transit.',
    },
    seoTitle: {
      type: String,
      default: 'History Packers & Movers | Safe Fast Reliable Shifting',
    },
    seoDescription: {
      type: String,
      default: 'Reliable packing and moving services in Jaipur. Home, car, two-wheeler, office and shop relocation with dedicated customer care.',
    },
  },
  {
    timestamps: true,
  }
);

// ACTIVITY LOG SCHEMA
const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userName: {
      type: String,
      default: 'System',
    },
    action: {
      type: String,
      required: true,
    },
    targetType: {
      type: String,
      default: 'General',
    },
    targetId: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ip: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = {
  Service: mongoose.model('Service', serviceSchema),
  Testimonial: mongoose.model('Testimonial', testimonialSchema),
  Gallery: mongoose.model('Gallery', gallerySchema),
  HeroCarousel: mongoose.model('HeroCarousel', heroCarouselSchema),
  FAQ: mongoose.model('FAQ', faqSchema),
  WebsiteSettings: mongoose.model('WebsiteSettings', websiteSettingsSchema),
  ActivityLog: mongoose.model('ActivityLog', activityLogSchema),
};

