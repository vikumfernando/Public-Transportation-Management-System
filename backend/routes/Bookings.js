const router = require("express").Router();
const mongoose = require("mongoose");
let Booking = require("../models/Booking");
let Bus = require("../models/RouteManagement/Bus");

//  date range for a given date (inclusive start, exclusive end)
function getDayRange(dateLike) {
  const d = new Date(dateLike);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  return { start, end };
}

// normalize seat numbers to strings
function normalizeSeatNumbersToStrings(seatNumbers) {
  if (!Array.isArray(seatNumbers)) return [];
  return seatNumbers.map(s => (s != null ? String(s) : s)).filter(s => s != null && s !== "");
}

// GET - Get seat layout and availability for a specific bus
router.route("/seat-layout/:busId").get(async (req, res) => {
  try {
    const { busId } = req.params;
    const { travelDate, fromStopId, toStopId } = req.query;

    if (!travelDate || !fromStopId || !toStopId) {
      return res.status(400).json({
        success: false,
        message: 'travelDate, fromStopId, and toStopId are required'
      });
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }

    const { start, end } = getDayRange(travelDate);
    const existingBookings = await Booking.find({
      busId: busId,
      travelDate: { $gte: start, $lt: end },
      bookingStatus: { $in: ['confirmed', 'completed'] }
    });

    const bookedSeats = normalizeSeatNumbersToStrings(existingBookings.flatMap(b => b.seatNumbers || []));
    const totalSeats = bus.totalSeats || bus.seatCount || bus.avlSeats;
    const seatLayout = generateSeatLayout(totalSeats, bookedSeats);

    const baseFare = 50;
    const farePerSeat = 125
      ;

    res.json({
      success: true,
      data: {
        busInfo: {
          busId: bus._id,
          vehicleNumber: bus.vehicleNumber,
          vehicleType: bus.vehicleType,
          totalSeats: totalSeats
        },
        travelInfo: { fromStopId, toStopId, travelDate },
        seatLayout: seatLayout,
        pricing: {
          baseFare: baseFare,
          farePerSeat: farePerSeat,
          totalFare: farePerSeat
        },
        bookedSeats: bookedSeats,
        availableSeats: totalSeats - bookedSeats.length
      }
    });

  } catch (error) {
    console.error('Error fetching seat layout:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching seat layout'
    });
  }
});

// Helper function to generate seat layout
function generateSeatLayout(totalSeats, bookedSeats) {
  const layout = {
    rows: [],
    legend: {
      available: 'Available',
      booked: 'Booked',
      selected: 'Selected',
      unavailable: 'Unavailable'
    }
  };

  const seatsPerRow = 4;
  const gangwayPosition = 2;
  const totalRows = Math.ceil(totalSeats / seatsPerRow);
  let seatNumber = 1;

  for (let row = 1; row <= totalRows; row++) {
    const rowSeats = [];

    for (let position = 1; position <= seatsPerRow; position++) {
      if (seatNumber > totalSeats) break;

      const seatId = seatNumber.toString().padStart(2, '0');
      const isBooked = bookedSeats.includes(seatId) || bookedSeats.includes(seatNumber.toString());

      rowSeats.push({
        seatId: seatId,
        seatNumber: seatNumber,
        position: position,
        status: isBooked ? 'booked' : 'available',
        type: getSeatType(position, seatsPerRow),
        fare: 1000
      });

      if (position === gangwayPosition && position < seatsPerRow) {
        rowSeats.push({ type: 'gangway' });
      }

      seatNumber++;
    }

    layout.rows.push({ rowNumber: row, seats: rowSeats });
  }

  return layout;
}

function getSeatType(position, seatsPerRow) {
  if (seatsPerRow === 4) {
    return (position === 1 || position === 4) ? 'window' : 'aisle';
  }
  return 'standard';
}

// POST - Create a new booking
router.route("/book").post(async (req, res) => {
  try {
    const {
      busId,
      userId,
      seatNumbers,
      fromStopId,
      toStopId,
      passengerDetails,
      totalFare,
      travelDate,
      contactInfo
    } = req.body;

    const missingFields = [];
    if (!busId) missingFields.push('busId');
    if (!seatNumbers) missingFields.push('seatNumbers');
    if (!fromStopId) missingFields.push('fromStopId');
    if (!toStopId) missingFields.push('toStopId');
    if (!passengerDetails) missingFields.push('passengerDetails');
    if (totalFare === undefined || totalFare === null) missingFields.push('totalFare');
    if (!travelDate) missingFields.push('travelDate');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `All required fields must be provided: ${missingFields.join(', ')}`
      });
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus not found' });
    }

    const requestedSeatNumbers = normalizeSeatNumbersToStrings(seatNumbers);
    const { start: startDay, end: endDay } = getDayRange(travelDate);
    const existingBookings = await Booking.find({
      busId: busId,
      travelDate: { $gte: startDay, $lt: endDay },
      bookingStatus: { $in: ['confirmed', 'completed'] },
      seatNumbers: { $in: requestedSeatNumbers }
    });

    if (existingBookings.length > 0) {
      return res.status(400).json({ success: false, message: 'One or more selected seats are already booked' });
    }

    if (!Array.isArray(passengerDetails) || passengerDetails.length !== seatNumbers.length) {
      return res.status(400).json({
        success: false,
        message: 'Number of passengers must match number of seats'
      });
    }

    const newBooking = new Booking({
      busId,
      userId,
      seatNumbers: requestedSeatNumbers,
      fromStopId,
      toStopId,
      passengerDetails,
      totalFare,
      travelDate: new Date(travelDate),
      contactInfo,
      paymentStatus: req.body.paymentStatus === 'paid' ? 'paid' : 'pending',
    });

    await newBooking.save();

    const populatedBooking = await Booking.findById(newBooking._id)
      .populate('busId', 'vehicleNumber vehicleType')
      .populate('fromStopId', 'stopName')
      .populate('toStopId', 'stopName');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking: populatedBooking,
        bookingId: populatedBooking.bookingId,
        nextSteps: [
          'Complete payment to confirm booking',
          'Download e-ticket after payment',
          'Arrive at boarding point 15 minutes early'
        ]
      }
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Server error while creating booking' });
  }
});

// GET - Get booking confirmation details
router.route("/confirmation/:bookingId").get(async (req, res) => {
  try {
    let { bookingId } = req.params;
    bookingId = (bookingId || '').trim();

    const booking = await Booking.findOne({ bookingId })
      .populate('busId', 'vehicleNumber vehicleType')
      .populate('userId', 'name email phone')
      .populate('fromStopId', 'stopName location')
      .populate('toStopId', 'stopName location');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({
      success: true,
      data: {
        bookingDetails: booking,
        qrCode: `${bookingId}`,
        instructions: [
          'Show this ticket to the conductor',
          'Carry a valid ID proof',
          'Be at the boarding point 15 minutes early'
        ]
      }
    });

  } catch (error) {
    console.error('Error fetching booking confirmation:', error?.message || error);
    res.status(500).json({ success: false, message: 'Server error while fetching booking confirmation' });
  }
});

// PUT - Update seat selection
router.route("/update-seats").put(async (req, res) => {
  try {
    const { bookingId, newSeatNumbers } = req.body;

    if (!bookingId || !newSeatNumbers) {
      return res.status(400).json({
        success: false,
        message: 'bookingId and newSeatNumbers are required'
      });
    }

    const booking = await Booking.findOne({
      bookingId: bookingId,
      paymentStatus: 'pending'
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or already confirmed'
      });
    }

    const normalizedNewSeatNumbers = normalizeSeatNumbersToStrings(newSeatNumbers);
    const { start: updStart, end: updEnd } = getDayRange(booking.travelDate);
    const conflictingBookings = await Booking.find({
      busId: booking.busId,
      travelDate: { $gte: updStart, $lt: updEnd },
      bookingStatus: { $in: ['confirmed', 'completed'] },
      seatNumbers: { $in: normalizedNewSeatNumbers },
      _id: { $ne: booking._id }
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected seats are already booked'
      });
    }

    booking.seatNumbers = normalizedNewSeatNumbers;
    await booking.save();

    res.json({
      success: true,
      message: 'Seat selection updated successfully',
      data: booking
    });

  } catch (error) {
    console.error('Error updating seat selection:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating seat selection'
    });
  }
});

// GET - Get bookings by query param userId
router.route("/by-user").get(async (req, res) => {
  try {
    const { userId, email } = req.query;

    let query = {};
    if (userId) {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        query.userId = new mongoose.Types.ObjectId(userId);
      } else {
        query.userId = userId;
      }
    } else if (email) {
      query['contactInfo.email'] = { $regex: `^${email}$`, $options: 'i' };
    } else {
      return res.status(400).json({ success: false, message: 'userId or email is required' });
    }

    const bookings = await Booking.find(query)
      .sort({ travelDate: -1 })
      .limit(50)
      .populate('busId', 'vehicleNumber vehicleType')
      .populate('fromStopId', 'stopName')
      .populate('toStopId', 'stopName');

    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error listing bookings by userId:', error);
    res.status(500).json({ success: false, message: 'Server error while listing bookings' });
  }
});

// GET - Get bookings by route param userId
router.route('/user/:userId').get(async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    let query = {};
    if (mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = new mongoose.Types.ObjectId(userId);
    } else {
      query.userId = userId;
    }

    const bookings = await Booking.find(query)
      .sort({ travelDate: -1 })
      .populate('busId', 'vehicleNumber vehicleType')
      .populate('fromStopId', 'stopName')
      .populate('toStopId', 'stopName');

    return res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching user bookings' });
  }
});

// PUT - Update passenger details
router.route('/:id/update').put(async (req, res) => {
  try {
    const { id } = req.params;
    const { passengerDetails, contactInfo } = req.body;

    if (!id || !Array.isArray(passengerDetails) || passengerDetails.length === 0) {
      return res.status(400).json({ success: false, message: 'id and passengerDetails are required' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    //validation if booking is akready completed
    if (booking.bookingStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Completed bookings cannot be updated' });
    }

    booking.passengerDetails = passengerDetails;
    if (contactInfo) booking.contactInfo = contactInfo;
    await booking.save();

    const populated = await Booking.findById(id)
      .populate('busId', 'vehicleNumber vehicleType')
      .populate('fromStopId', 'stopName')
      .populate('toStopId', 'stopName');

    return res.json({ success: true, message: 'Booking updated', data: populated });
  } catch (error) {
    console.error('Error updating booking:', error);
    return res.status(500).json({ success: false, message: 'Server error while updating booking' });
  }
});

// PUT - Cancel booking by id
router.route('/:id/cancel').put(async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Booking.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (existing.bookingStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Completed bookings cannot be cancelled' });
    }

    const update = { bookingStatus: 'cancelled' };
    if (existing.paymentStatus === 'paid') {
      update.paymentStatus = 'refunded';
    }

    const updated = await Booking.findByIdAndUpdate(id, { $set: update }, { new: true })
      .populate('busId', 'vehicleNumber vehicleType')
      .populate('fromStopId', 'stopName')
      .populate('toStopId', 'stopName');

    return res.json({ success: true, message: 'Booking cancelled', data: updated });
  } catch (error) {
    console.error('Error cancelling booking by id:', error);
    return res.status(500).json({ success: false, message: 'Server error while cancelling booking' });
  }
});

// DELETE - Permanently delete a booking by id or bookingId (fallback via query)
router.route('/:id').delete(async (req, res) => {
  try {
    const { id } = req.params;
    let deleted = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Booking.findByIdAndDelete(id);
    }

    // Fallback: allow deletion by bookingId via query string
    if (!deleted && req.query && req.query.bookingId) {
      deleted = await Booking.findOneAndDelete({ bookingId: String(req.query.bookingId).trim() });
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    return res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return res.status(500).json({ success: false, message: 'Server error while deleting booking' });
  }
});

// DELETE - Bulk delete bookings with filters (safer). Requires at least one filter
// Supported query params: userId, email, status, olderThan (ISO date), beforeDate (alias)
router.route('/').delete(async (req, res) => {
  try {
    const { userId, email, status, olderThan, beforeDate } = req.query;

    const filter = {};

    if (userId) {
      filter.userId = mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : userId;
    }

    if (email) {
      filter['contactInfo.email'] = { $regex: `^${String(email)}$`, $options: 'i' };
    }

    if (status) {
      filter.bookingStatus = String(status).toLowerCase();
    }

    const cutoff = olderThan || beforeDate;
    if (cutoff) {
      const d = new Date(cutoff);
      if (!isNaN(d.getTime())) {
        filter.travelDate = { $lt: d };
      }
    }

    if (Object.keys(filter).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one filter: userId, email, status, olderThan'
      });
    }

    const result = await Booking.deleteMany(filter);
    return res.json({ success: true, deletedCount: result.deletedCount || 0 });
  } catch (error) {
    console.error('Error bulk deleting bookings:', error);
    return res.status(500).json({ success: false, message: 'Server error while bulk deleting bookings' });
  }
});

// DELETE - Dangerous: delete ALL bookings. Requires confirm=true
router.route('/all').delete(async (req, res) => {
  try {
    if (String(req.query.confirm).toLowerCase() !== 'true') {
      return res.status(400).json({ success: false, message: 'Set confirm=true to delete ALL bookings' });
    }
    const result = await Booking.deleteMany({});
    return res.json({ success: true, deletedCount: result.deletedCount || 0 });
  } catch (error) {
    console.error('Error deleting ALL bookings:', error);
    return res.status(500).json({ success: false, message: 'Server error while deleting all bookings' });
  }
});

module.exports = router;
