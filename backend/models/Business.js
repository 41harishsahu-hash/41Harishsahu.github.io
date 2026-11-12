const mongoose = require('mongoose');

const internalNoteSchema = new mongoose.Schema({
  note: { type: String, required: true },
  addedBy: { type: String, default: 'Admin' },
  createdAt: { type: Date, default: Date.now },
});

const trackingUpdateSchema = new mongoose.Schema({
  status: { type: String, required: true },
  location: { type: String, default: '' },
  remarks: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
});

// ENQUIRY SCHEMA
const enquirySchema = new mongoose.Schema(
  {
    enquiryNumber: {
      type: String,
      unique: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      maxlength: 50,
    },
    pickupAddress: {
      type: String,
      required: [true, 'Pickup address is required'],
      minlength: 5,
      maxlength: 3000,
      trim: true,
    },
    destinationAddress: {
      type: String,
      required: [true, 'Destination address is required'],
      minlength: 5,
      maxlength: 3000,
      trim: true,
    },
    pickupCity: {
      type: String,
      required: [true, 'Pickup city is required'],
      trim: true,
      maxlength: 250,
    },
    destinationCity: {
      type: String,
      required: [true, 'Destination city is required'],
      trim: true,
      maxlength: 250,
    },
    serviceType: {
      type: String,
      required: [true, 'Service type is required'],
      trim: true,
    },
    movingDate: {
      type: Date,
      required: [true, 'Moving date is required'],
    },
    propertyType: {
      type: String,
      trim: true,
      default: 'General',
    },
    message: {
      type: String,
      maxlength: 5000,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Quotation Sent', 'Negotiation', 'Converted', 'Rejected', 'Closed'],
      default: 'New',
      index: true,
    },
    quoteAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    customerResponse: {
      type: String,
      default: '',
      trim: true,
    },
    internalNotes: [internalNoteSchema],
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate human-friendly enquiry number before save
enquirySchema.pre('save', function (next) {
  if (!this.enquiryNumber) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const datePrefix = new Date().getFullYear();
    this.enquiryNumber = `HPM-ENQ-${datePrefix}-${randomSuffix}`;
  }
  next();
});

// BOOKING SCHEMA
const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      index: true,
    },
    enquiryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enquiry',
      default: null,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerMobile: {
      type: String,
      required: [true, 'Customer mobile is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true,
    },
    pickupAddress: {
      type: String,
      required: [true, 'Pickup address is required'],
      trim: true,
    },
    destinationAddress: {
      type: String,
      required: [true, 'Destination address is required'],
      trim: true,
    },
    pickupCity: {
      type: String,
      required: [true, 'Pickup city is required'],
      trim: true,
    },
    destinationCity: {
      type: String,
      required: [true, 'Destination city is required'],
      trim: true,
    },
    serviceType: {
      type: String,
      required: [true, 'Service type is required'],
      trim: true,
    },
    movingDate: {
      type: Date,
      required: [true, 'Moving date is required'],
    },
    propertyType: {
      type: String,
      default: 'General',
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Packing', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    quoteAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Partial', 'Paid'],
      default: 'Pending',
      index: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentNotes: {
      type: String,
      default: '',
    },
    internalNotes: [internalNoteSchema],
    trackingUpdates: [trackingUpdateSchema],
  },
  {
    timestamps: true,
  }
);

// Auto-generate human-friendly booking number before save
bookingSchema.pre('save', function (next) {
  if (!this.bookingNumber) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const datePrefix = new Date().getFullYear();
    this.bookingNumber = `HPM-BK-${datePrefix}-${randomSuffix}`;
  }
  next();
});

module.exports = {
  Enquiry: mongoose.model('Enquiry', enquirySchema),
  Booking: mongoose.model('Booking', bookingSchema),
};

