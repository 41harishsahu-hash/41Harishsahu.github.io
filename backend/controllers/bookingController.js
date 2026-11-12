const { Booking } = require('../models/Business');
const { ActivityLog } = require('../models/Content');
const { bookingCreateSchema } = require('../validators/schemas');

// Customer: Get my bookings
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      $or: [
        { customerId: req.user._id },
        { customerEmail: req.user.email },
        { customerMobile: req.user.mobile },
      ],
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

// Customer: Get single booking by ID (only if belonging to the customer)
const getMyBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      $or: [
        { customerId: req.user._id },
        { customerEmail: req.user.email },
        { customerMobile: req.user.mobile },
      ],
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking record not found or access restricted.',
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Get all bookings with filtering & search
const getAllBookings = async (req, res, next) => {
  try {
    const {
      status,
      paymentStatus,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (paymentStatus && paymentStatus !== 'All') {
      query.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      query.movingDate = {};
      if (startDate) query.movingDate.$gte = new Date(startDate);
      if (endDate) query.movingDate.$lte = new Date(endDate);
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { bookingNumber: searchRegex },
        { customerName: searchRegex },
        { customerEmail: searchRegex },
        { customerMobile: searchRegex },
        { pickupCity: searchRegex },
        { destinationCity: searchRegex },
      ];
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNumber - 1) * limitNumber;

    const [bookings, total] = await Promise.all([
      Booking.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNumber),
      Booking.countDocuments(query),
    ]);

    res.json({
      success: true,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber) || 1,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Get booking by ID
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Direct create booking
const createBooking = async (req, res, next) => {
  try {
    const validatedData = bookingCreateSchema.parse(req.body);

    const booking = new Booking({
      ...validatedData,
      trackingUpdates: [
        {
          status: validatedData.status || 'Pending',
          remarks: validatedData.remarks || 'Booking created by administration.',
          timestamp: new Date(),
        },
      ],
    });

    await booking.save();

    await ActivityLog.create({
      userId: req.user?._id,
      userName: req.user?.name || 'Admin',
      action: 'BOOKING_CREATED',
      targetType: 'Booking',
      targetId: booking.bookingNumber,
      details: { customerName: booking.customerName, serviceType: booking.serviceType },
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Update booking details, tracking & payment
const updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    const {
      status,
      quoteAmount,
      paymentStatus,
      paidAmount,
      paymentNotes,
      pickupAddress,
      destinationAddress,
      pickupCity,
      destinationCity,
      movingDate,
      trackingLocation,
      trackingRemarks,
      internalNote,
    } = req.body;

    const previousStatus = booking.status;

    if (status && status !== booking.status) {
      booking.status = status;
      // Append tracking step
      booking.trackingUpdates.push({
        status,
        location: trackingLocation || '',
        remarks: trackingRemarks || `Status updated to ${status}`,
        timestamp: new Date(),
      });
    } else if (trackingRemarks || trackingLocation) {
      booking.trackingUpdates.push({
        status: booking.status,
        location: trackingLocation || '',
        remarks: trackingRemarks || 'Location update',
        timestamp: new Date(),
      });
    }

    if (typeof quoteAmount === 'number') booking.quoteAmount = quoteAmount;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (typeof paidAmount === 'number') booking.paidAmount = paidAmount;
    if (typeof paymentNotes === 'string') booking.paymentNotes = paymentNotes;
    if (pickupAddress) booking.pickupAddress = pickupAddress;
    if (destinationAddress) booking.destinationAddress = destinationAddress;
    if (pickupCity) booking.pickupCity = pickupCity;
    if (destinationCity) booking.destinationCity = destinationCity;
    if (movingDate) booking.movingDate = new Date(movingDate);

    if (internalNote && internalNote.trim()) {
      booking.internalNotes.push({
        note: internalNote.trim(),
        addedBy: req.user?.name || 'Admin',
        createdAt: new Date(),
      });
    }

    await booking.save();

    await ActivityLog.create({
      userId: req.user?._id,
      userName: req.user?.name || 'Admin',
      action: 'BOOKING_UPDATED',
      targetType: 'Booking',
      targetId: booking.bookingNumber,
      details: { previousStatus, currentStatus: booking.status },
    }).catch(() => {});

    res.json({
      success: true,
      message: 'Booking updated successfully.',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Delete booking
const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    await Booking.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      userId: req.user?._id,
      userName: req.user?.name || 'Admin',
      action: 'BOOKING_DELETED',
      targetType: 'Booking',
      targetId: booking.bookingNumber,
    }).catch(() => {});

    res.json({
      success: true,
      message: 'Booking record removed successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyBookings,
  getMyBookingById,
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
};

