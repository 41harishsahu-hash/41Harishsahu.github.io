const { z } = require('zod');

// Word count calculator using actual words
const countWords = (val) => {
  if (!val || typeof val !== 'string' || !val.trim()) return 0;
  return val.trim().split(/\s+/).filter(Boolean).length;
};

// Normalizes Indian phone numbers: strips +91, 0 prefix, spaces, dashes
const normalizeIndianMobile = (val) => {
  if (typeof val !== 'string') return '';
  let cleaned = val.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }
  return cleaned;
};

const mobileValidator = z
  .string({ required_error: 'Mobile number is required' })
  .trim()
  .min(10, 'Mobile number must be at least 10 digits')
  .max(16, 'Mobile number is too long')
  .refine((val) => {
    const cleaned = normalizeIndianMobile(val);
    return /^[6-9]\d{9}$/.test(cleaned);
  }, {
    message: 'Please provide a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9)',
  })
  .transform((val) => normalizeIndianMobile(val));

const nameValidator = z
  .string({ required_error: 'Full Name is required' })
  .trim()
  .min(2, 'Full Name must be at least 2 characters')
  .max(50, 'Full Name cannot exceed 50 characters')
  .refine((val) => /^[a-zA-Z\s]+$/.test(val), {
    message: 'Full Name can only contain alphabets and spaces',
  });

const emailValidator = z
  .string({ required_error: 'Email address is required' })
  .trim()
  .min(5, 'Email address must be at least 5 characters')
  .max(50, 'Email address cannot exceed 50 characters')
  .email('Please enter a valid email address')
  .transform((val) => val.toLowerCase());

const cityValidator = (fieldName) =>
  z
    .string({ required_error: `${fieldName} is required` })
    .trim()
    .min(2, `${fieldName} must be at least 2 characters`)
    .refine((val) => countWords(val) <= 25, {
      message: `${fieldName} cannot exceed 25 words`,
    })
    .refine((val) => /^[a-zA-Z0-9\s.,'-]+$/.test(val), {
      message: `${fieldName} must contain valid alphabets, spaces and punctuation`,
    });

const addressValidator = (fieldName) =>
  z
    .string({ required_error: `${fieldName} is required` })
    .trim()
    .min(5, `${fieldName} must be at least 5 characters`)
    .refine((val) => countWords(val) <= 250, {
      message: `${fieldName} cannot exceed 250 words`,
    });

const messageValidator = z
  .string()
  .trim()
  .optional()
  .default('')
  .refine((val) => !val || countWords(val) <= 500, {
    message: 'Message cannot exceed 500 words',
  });

const passwordValidator = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password cannot exceed 72 characters')
  .refine((val) => /[A-Za-z]/.test(val) && /\d/.test(val), {
    message: 'Password must contain at least one letter and one number',
  });

// AUTH SCHEMAS
const registerSchema = z.object({
  name: nameValidator,
  email: emailValidator,
  mobile: mobileValidator,
  password: passwordValidator,
});

const loginSchema = z.object({
  email: emailValidator,
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordValidator,
});

const updateProfileSchema = z.object({
  name: nameValidator,
  mobile: mobileValidator,
});

// ENQUIRY SCHEMAS
const enquirySchema = z.object({
  name: nameValidator,
  email: emailValidator,
  mobile: mobileValidator,
  pickupAddress: addressValidator('Pickup address'),
  destinationAddress: addressValidator('Destination address'),
  pickupCity: cityValidator('Pickup city'),
  destinationCity: cityValidator('Destination city'),
  serviceType: z.string().trim().min(2, 'Service type is required').max(80),
  movingDate: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .refine((d) => !isNaN(d.getTime()), { message: 'Valid moving date is required' }),
  propertyType: z.string().trim().max(60).optional().default('General'),
  message: messageValidator,
});

// BOOKING SCHEMAS
const bookingCreateSchema = z.object({
  enquiryId: z.string().optional(),
  customerId: z.string().optional(),
  customerName: nameValidator,
  customerEmail: emailValidator,
  customerMobile: mobileValidator,
  pickupAddress: addressValidator('Pickup address'),
  destinationAddress: addressValidator('Destination address'),
  pickupCity: cityValidator('Pickup city'),
  destinationCity: cityValidator('Destination city'),
  serviceType: z.string().trim().min(2).max(80),
  movingDate: z.string().or(z.date()).transform((val) => new Date(val)),
  propertyType: z.string().trim().optional().default('General'),
  quoteAmount: z.number().min(0).optional().default(0),
  status: z.enum(['Pending', 'Confirmed', 'Packing', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled']).optional().default('Pending'),
  paymentStatus: z.enum(['Pending', 'Partial', 'Paid']).optional().default('Pending'),
  paidAmount: z.number().min(0).optional().default(0),
  paymentNotes: z.string().max(500).optional().default(''),
  remarks: z.string().max(500).optional().default(''),
});

// SERVICE SCHEMA
const serviceSchema = z.object({
  title: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(100).optional(),
  shortDescription: z.string().trim().min(10).max(300),
  fullDescription: z.string().trim().min(20),
  icon: z.string().optional().default('Truck'),
  image: z.object({ url: z.string(), publicId: z.string().optional() }).optional(),
  benefits: z.array(z.string()).optional().default([]),
  displayOrder: z.number().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

// TESTIMONIAL SCHEMA
const testimonialSchema = z.object({
  name: nameValidator,
  location: z.string().trim().max(60).optional().default('Jaipur'),
  rating: z.number().min(1).max(5).default(5),
  comment: z.string().trim().min(5).max(500),
  serviceUsed: z.string().trim().max(80).optional().default('Home Relocation'),
  avatarUrl: z.string().optional().default(''),
  isApproved: z.boolean().optional().default(true),
  displayOrder: z.number().optional().default(0),
});

// SETTINGS SCHEMA
const websiteSettingsSchema = z.object({
  companyName: z.string().trim().min(2).max(100).optional(),
  tagline: z.string().trim().max(100).optional(),
  phone1: z.string().trim().max(25).optional(),
  phone2: z.string().trim().max(25).optional(),
  email: z.string().trim().email().optional(),
  address: z.string().trim().max(250).optional(),
  city: z.string().trim().max(60).optional(),
  state: z.string().trim().max(60).optional(),
  whatsappNumber: z.string().trim().max(25).optional(),
  heroHeadline: z.string().trim().max(150).optional(),
  heroSubtext: z.string().trim().max(500).optional(),
  aboutStory: z.string().trim().max(2000).optional(),
  seoTitle: z.string().trim().max(120).optional(),
  seoDescription: z.string().trim().max(300).optional(),
});

// GALLERY SCHEMA
const gallerySchemaValidator = z.object({
  title: z.string().trim().min(2, 'Project title must be at least 2 characters').max(120),
  category: z.string().trim().max(80).optional().default('Household Shifting'),
  description: z.string().trim().max(500).optional().default(''),
  projectDate: z.string().or(z.date()).optional().default(() => new Date()),
  location: z.string().trim().max(100).optional().default('Jaipur'),
  imageUrl: z.string().trim().min(1, 'Image URL or file is required'),
  publicId: z.string().trim().optional().default(''),
  displayOrder: z.number().optional().default(0),
  isPublished: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
});

// HERO CAROUSEL SCHEMA
const heroCarouselSchemaValidator = z.object({
  title: z.string().trim().max(120).optional().default(''),
  description: z.string().trim().max(300).optional().default(''),
  imageUrl: z.string().trim().min(1, 'Image URL or file is required'),
  publicId: z.string().trim().optional().default(''),
  displayOrder: z.number().optional().default(0),
  isPublished: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
});

module.exports = {
  countWords,
  normalizeIndianMobile,
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
  enquirySchema,
  bookingCreateSchema,
  serviceSchema,
  testimonialSchema,
  websiteSettingsSchema,
  gallerySchemaValidator,
  heroCarouselSchemaValidator,
};

