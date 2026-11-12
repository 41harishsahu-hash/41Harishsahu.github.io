const { Enquiry, Booking } = require('../models/Business');
const { ActivityLog } = require('../models/Content');
const User = require('../models/User');
const { enquirySchema } = require('../validators/schemas');

// Submit an enquiry (Public or Authenticated Customer)
const createEnquiry = async (req, res, next) => {
  try {
    const validatedData = enquirySchema.parse(req.body);

    let customerId = req.user ? req.user._id : null;

    // If not logged in, see if an account already exists for this email
    if (!customerId) {
      const existingUser = await User.findOne({ email: validatedData.email });
      if (existingUser) {
        customerId = existingUser._id;
      }
    }

    const enquiry = new Enquiry({
      ...validatedData,
      customerId,
      status: 'New',
    });

    await enquiry.save();

    await ActivityLog.create({
      userId: customerId,
      userName: validatedData.name,
      action: 'ENQUIRY_CREATED',
      targetType: 'Enquiry',
      targetId: enquiry.enquiryNumber,
      details: {
        serviceType: validatedData.serviceType,
        pickupCity: validatedData.pickupCity,
        destinationCity: validatedData.destinationCity,
      },
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Thank you! Your quotation enquiry has been submitted. Our relocation team will contact you shortly.',
      data: {
        enquiryNumber: enquiry.enquiryNumber,
        serviceType: enquiry.serviceType,
        movingDate: enquiry.movingDate,
        createdAt: enquiry.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Customer: Get my enquiries
const getMyEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find({
      $or: [
        { customerId: req.user._id },
        { email: req.user.email },
        { mobile: req.user.mobile },
      ],
      isArchived: false,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Get all enquiries with filtering, search & pagination
const getAllEnquiries = async (req, res, next) => {
  try {
    const {
      status,
      serviceType,
      search,
      startDate,
      endDate,
      archived,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (archived === 'true') {
      query.isArchived = true;
    } else {
      query.isArchived = false;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (serviceType && serviceType !== 'All') {
      query.serviceType = serviceType;
    }

    if (startDate || endDate) {
      query.movingDate = {};
      if (startDate) query.movingDate.$gte = new Date(startDate);
      if (endDate) query.movingDate.$lte = new Date(endDate);
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { enquiryNumber: searchRegex },
        { name: searchRegex },
        { email: searchRegex },
        { mobile: searchRegex },
        { pickupCity: searchRegex },
        { destinationCity: searchRegex },
      ];
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNumber - 1) * limitNumber;

    const [enquiries, total] = await Promise.all([
      Enquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNumber),
      Enquiry.countDocuments(query),
    ]);

    res.json({
      success: true,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber) || 1,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Get enquiry by ID
const getEnquiryById = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.',
      });
    }

    res.json({
      success: true,
      data: enquiry,
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Update enquiry (status, quote, notes, customer response)
const updateEnquiry = async (req, res, next) => {
  try {
    const { status, quoteAmount, customerResponse, internalNote, isArchived } = req.body;
    const enquiry = await Enquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.',
      });
    }

    if (status) enquiry.status = status;
    if (typeof quoteAmount === 'number') enquiry.quoteAmount = quoteAmount;
    if (typeof customerResponse === 'string') enquiry.customerResponse = customerResponse;
    if (typeof isArchived === 'boolean') enquiry.isArchived = isArchived;

    if (internalNote && internalNote.trim()) {
      enquiry.internalNotes.push({
        note: internalNote.trim(),
        addedBy: req.user ? req.user.name : 'Admin',
        createdAt: new Date(),
      });
    }

    await enquiry.save();

    await ActivityLog.create({
      userId: req.user?._id,
      userName: req.user?.name || 'Admin',
      action: 'ENQUIRY_UPDATED',
      targetType: 'Enquiry',
      targetId: enquiry.enquiryNumber,
      details: { status: enquiry.status, quoteAmount: enquiry.quoteAmount },
    }).catch(() => {});

    res.json({
      success: true,
      message: 'Enquiry updated successfully.',
      data: enquiry,
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Convert enquiry into a booking
const convertToBooking = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.',
      });
    }

    // Check if a booking already exists for this enquiry
    const existingBooking = await Booking.findOne({ enquiryId: enquiry._id });
    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: `A booking (${existingBooking.bookingNumber}) is already linked to this enquiry.`,
        data: existingBooking,
      });
    }

    const booking = new Booking({
      enquiryId: enquiry._id,
      customerId: enquiry.customerId,
      customerName: enquiry.name,
      customerMobile: enquiry.mobile,
      customerEmail: enquiry.email,
      pickupAddress: enquiry.pickupAddress,
      destinationAddress: enquiry.destinationAddress,
      pickupCity: enquiry.pickupCity,
      destinationCity: enquiry.destinationCity,
      serviceType: enquiry.serviceType,
      movingDate: enquiry.movingDate,
      propertyType: enquiry.propertyType,
      quoteAmount: req.body.quoteAmount ?? enquiry.quoteAmount,
      status: 'Confirmed',
      paymentStatus: req.body.paymentStatus || 'Pending',
      paidAmount: req.body.paidAmount || 0,
      paymentNotes: req.body.paymentNotes || '',
      internalNotes: [
        {
          note: `Converted from enquiry #${enquiry.enquiryNumber}`,
          addedBy: req.user?.name || 'Admin',
        },
      ],
      trackingUpdates: [
        {
          status: 'Confirmed',
          remarks: 'Booking confirmed and scheduled for relocation.',
          timestamp: new Date(),
        },
      ],
    });

    await booking.save();

    enquiry.status = 'Converted';
    enquiry.internalNotes.push({
      note: `Converted to booking #${booking.bookingNumber}`,
      addedBy: req.user?.name || 'Admin',
    });
    await enquiry.save();

    await ActivityLog.create({
      userId: req.user?._id,
      userName: req.user?.name || 'Admin',
      action: 'BOOKING_CONVERTED_FROM_ENQUIRY',
      targetType: 'Booking',
      targetId: booking.bookingNumber,
      details: { enquiryNumber: enquiry.enquiryNumber },
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: `Enquiry converted successfully! Booking reference: ${booking.bookingNumber}`,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Delete enquiry
const deleteEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found.',
      });
    }

    await Enquiry.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      userId: req.user?._id,
      userName: req.user?.name || 'Admin',
      action: 'ENQUIRY_DELETED',
      targetType: 'Enquiry',
      targetId: enquiry.enquiryNumber,
    }).catch(() => {});

    res.json({
      success: true,
      message: 'Enquiry removed successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createEnquiry,
  getMyEnquiries,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiry,
  convertToBooking,
  deleteEnquiry,
};

