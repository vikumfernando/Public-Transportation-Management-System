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

// Test endpoint to check bus data
router.route("/test-bus/:busId").get(async (req, res) => {
  try {
    const { busId } = req.params;
    console.log('Testing bus with ID:', busId);

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error('Database not connected. Ready state:', mongoose.connection.readyState);
      return res.status(500).json({
        success: false,
        message: 'Database not connected',
        error: 'Database connection error'
      });
    }

    // Check if Bus model is available
    if (!Bus) {
      console.error('Bus model not available');
      return res.status(500).json({
        success: false,
        message: 'Bus model not available',
        error: 'Database model error'
      });
    }

    console.log('Attempting to find bus with ID:', busId);
    const bus = await Bus.findById(busId).populate('route', 'routeName routeNum');
    console.log('Found bus:', bus);

    if (!bus) {
      console.log('Bus not found in database, but this is okay - we can create fallback');
      return res.json({
        success: true,
        message: 'Bus not found in database, will use fallback',
        data: {
          busId: busId,
          vehicleNumber: 'BUS-' + busId.substring(0, 8),
          vehicleType: 'Standard',
          avlSeats: 60,
          totalSeats: 60,
          seatCount: 60,
          route: null,
          isFallback: true
        }
      });
    }

    res.json({
      success: true,
      data: {
        busId: bus._id,
        vehicleNumber: bus.vehicleNumber,
        vehicleType: bus.vehicleType,
        avlSeats: bus.avlSeats,
        totalSeats: bus.totalSeats,
        seatCount: bus.seatCount,
        route: bus.route,
        isFallback: false
      }
    });
  } catch (error) {
    console.error('Error testing bus:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'Server error while testing bus',
      error: error.message
    });
  }
});

// GET - Get seat layout and availability for a specific bus
router.route("/seat-layout/:busId").get(async (req, res) => {
  try {
    const { busId } = req.params;
    const { travelDate, fromStopId, toStopId } = req.query;

    console.log('Seat layout request:', { busId, travelDate, fromStopId, toStopId });

    if (!travelDate || !fromStopId || !toStopId) {
      console.log('Missing required parameters');
      return res.status(400).json({
        success: false,
        message: 'travelDate, fromStopId, and toStopId are required'
      });
    }

    // Check if travel date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    const selectedDate = new Date(travelDate);
    selectedDate.setHours(0, 0, 0, 0); // Set to start of selected date

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot access seat layout for previous dates. Please select today or a future date.'
      });
    }

    let bus;
    try {
      bus = await Bus.findById(busId).populate('route', 'routeName routeNum');
      console.log('Found bus:', bus ? 'Yes' : 'No');
    } catch (dbError) {
      console.error('Database error finding bus:', dbError);
      bus = null;
    }

    if (!bus) {
      console.log('Bus not found or database error, creating fallback bus data');
      // Create a fallback bus object if bus doesn't exist
      bus = {
        _id: busId,
        vehicleNumber: 'BUS-' + busId.substring(0, 8),
        vehicleType: 'Standard',
        avlSeats: 60,
        totalSeats: 60,
        seatCount: 60,
        route: null
      };
      console.log('Using fallback bus:', bus);
    }

    const { start, end } = getDayRange(travelDate);
    console.log('Date range:', { start, end });

    let existingBookings = [];
    try {
      existingBookings = await Booking.find({
        busId: busId,
        travelDate: { $gte: start, $lt: end },
        bookingStatus: { $in: ['confirmed', 'completed'] }
      });
      console.log('Found existing bookings:', existingBookings.length);
    } catch (bookingError) {
      console.error('Error fetching existing bookings:', bookingError);
      console.log('Continuing with empty bookings list');
    }

    const bookedSeats = normalizeSeatNumbersToStrings(existingBookings.flatMap(b => b.seatNumbers || []));
    console.log('Booked seats:', bookedSeats);

    const totalSeats = bus.totalSeats || bus.seatCount || bus.avlSeats || 60; // Default to 60 if none found
    console.log('Total seats:', totalSeats);
    console.log('Bus fields:', { totalSeats: bus.totalSeats, seatCount: bus.seatCount, avlSeats: bus.avlSeats });

    if (!totalSeats || totalSeats <= 0) {
      console.error('Invalid total seats:', totalSeats);
      return res.status(400).json({
        success: false,
        message: 'Bus has invalid seat configuration'
      });
    }

    let seatLayout;
    try {
      seatLayout = generateSeatLayout(totalSeats, bookedSeats);
      console.log('Generated seat layout:', seatLayout);
    } catch (layoutError) {
      console.error('Error generating seat layout:', layoutError);
      return res.status(500).json({
        success: false,
        message: 'Error generating seat layout: ' + layoutError.message
      });
    }

    const baseFare = 50;
    const farePerSeat = 125;

    const responseData = {
      success: true,
      data: {
        busInfo: {
          busId: bus._id,
          vehicleNumber: bus.vehicleNumber,
          vehicleType: bus.vehicleType,
          totalSeats: totalSeats,
          route: bus.route ? {
            routeName: bus.route.routeName,
            routeNum: bus.route.routeNum
          } : null
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
    };

    console.log('Sending response:', responseData);
    res.json(responseData);

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

    // Check if travel date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    const selectedDate = new Date(travelDate);
    selectedDate.setHours(0, 0, 0, 0); // Set to start of selected date

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book seats for previous dates. Please select today or a future date.'
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

    console.log('Creating booking with data:', {
      busId,
      userId,
      seatNumbers: requestedSeatNumbers,
      fromStopId,
      toStopId,
      passengerDetails,
      totalFare,
      travelDate,
      contactInfo,
      paymentStatus: req.body.paymentStatus
    });

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

    console.log('Booking object created:', newBooking);
    await newBooking.save();
    console.log('Booking saved successfully');

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
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'Server error while creating booking',
      error: error.message
    });
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

// PUT - Update booking details (passengers, seats, dates, etc.)
router.route('/:id/update').put(async (req, res) => {
  try {
    const { id } = req.params;
    const {
      passengerDetails,
      contactInfo,
      seatNumbers,
      newSeats, // Array of new seats to add
      newPassengers, // Array of passengers for new seats
      travelDate,
      fromStopId,
      toStopId,
      totalFare
    } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'id is required' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    //validation if booking is already completed
    if (booking.bookingStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Completed bookings cannot be updated' });
    }

    // Update passenger details if provided
    if (Array.isArray(passengerDetails) && passengerDetails.length > 0) {
      booking.passengerDetails = passengerDetails;
    }

    // Update contact info if provided
    if (contactInfo) {
      booking.contactInfo = contactInfo;
    }

    // Update seat numbers if provided (replace existing seats)
    if (seatNumbers && Array.isArray(seatNumbers)) {
      // Check if new seats are available
      const { start: startDay, end: endDay } = getDayRange(booking.travelDate);
      const existingBookings = await Booking.find({
        busId: booking.busId,
        travelDate: { $gte: startDay, $lt: endDay },
        bookingStatus: { $in: ['confirmed', 'completed'] },
        seatNumbers: { $in: seatNumbers },
        _id: { $ne: booking._id }
      });

      if (existingBookings.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'One or more selected seats are already booked'
        });
      }

      booking.seatNumbers = normalizeSeatNumbersToStrings(seatNumbers);
    }

    // Add new seats if provided (append to existing seats)
    if (newSeats && Array.isArray(newSeats) && newSeats.length > 0) {
      // Validate that new passengers are provided for new seats
      if (!newPassengers || !Array.isArray(newPassengers) || newPassengers.length !== newSeats.length) {
        return res.status(400).json({
          success: false,
          message: 'newPassengers array must be provided and match the length of newSeats'
        });
      }

      // Check if new seats are available
      const { start: startDay, end: endDay } = getDayRange(booking.travelDate);
      const existingBookings = await Booking.find({
        busId: booking.busId,
        travelDate: { $gte: startDay, $lt: endDay },
        bookingStatus: { $in: ['confirmed', 'completed'] },
        seatNumbers: { $in: newSeats },
        _id: { $ne: booking._id }
      });

      if (existingBookings.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'One or more new seats are already booked'
        });
      }

      // Validate new passengers
      for (const p of newPassengers) {
        if (!p || !p.name || typeof p.age === 'undefined') {
          return res.status(400).json({ success: false, message: 'Each new passenger requires name and age' });
        }
        const ageNum = Number(p.age);
        if (Number.isNaN(ageNum) || ageNum < 1 || ageNum > 100) {
          return res.status(400).json({ success: false, message: 'New passenger age must be between 1 and 100' });
        }
      }

      // Append new seats and passengers
      const normalizedNewSeats = normalizeSeatNumbersToStrings(newSeats);
      booking.seatNumbers = [...(booking.seatNumbers || []), ...normalizedNewSeats];
      booking.passengerDetails = [...(booking.passengerDetails || []), ...newPassengers];
    }

    // Update travel date if provided
    if (travelDate) {
      booking.travelDate = new Date(travelDate);
    }

    // Update stops if provided
    if (fromStopId) {
      booking.fromStopId = fromStopId;
    }
    if (toStopId) {
      booking.toStopId = toStopId;
    }

    // Update total fare if provided
    if (totalFare !== undefined && totalFare !== null) {
      booking.totalFare = totalFare;
    }

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

// PUT - Cancel booking by id with automatic refund
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

    console.log('Cancelling booking:', {
      _id: existing._id,
      bookingId: existing.bookingId,
      userId: existing.userId,
      busId: existing.busId,
      paymentStatus: existing.paymentStatus,
      totalFare: existing.totalFare
    });

    const update = { bookingStatus: 'cancelled' };
    let refundResult = null;

    // Process automatic refund if booking was paid
    if (existing.paymentStatus === 'paid') {
      update.paymentStatus = 'refunded';

      try {
        // Find the transaction for this booking
        const Transaction = require('../models/Transaction');
        console.log('Looking for transaction with bookingId:', existing.bookingId || existing._id);

        // Since transaction doesn't have userId field, search by amount and card info
        console.log('Searching for transaction with criteria:', {
          totalFare: existing.totalFare,
          transactionType: 'transport_payment',
          status: 'completed'
        });

        let transaction = await Transaction.findOne({
          transactionType: 'transport_payment',
          status: 'completed',
          amount: existing.totalFare
        });

        // If not found by amount, try broader search
        if (!transaction) {
          console.log('Transaction not found by amount, trying broader search...');
          transaction = await Transaction.findOne({
            transactionType: 'transport_payment',
            status: 'completed'
          }).sort({ timestamp: -1 }); // Get most recent

          if (transaction) {
            console.log('Found transaction with broader search');
          } else {
            console.log('Still no transaction found, listing all transport transactions...');
            // Try to find any transport payment transaction
            const broadSearch = await Transaction.find({
              transactionType: 'transport_payment',
              status: 'completed'
            }).limit(5);
            console.log('Found transport transactions:', broadSearch.length);
            broadSearch.forEach(t => {
              console.log('Transaction:', {
                _id: t._id,
                amount: t.amount,
                cardNumber: t.cardNumber,
                timestamp: t.timestamp
              });
            });
          }
        }

        console.log('Found transaction:', transaction ? 'Yes' : 'No');
        if (transaction) {
          console.log('Transaction details:', {
            cardNumber: transaction.cardNumber,
            amount: transaction.amount,
            transactionType: transaction.transactionType
          });
        }

        if (transaction) {
          // Process refund to the card
          const NFCCard = require('../models/NFCCard');
          console.log('Looking for card with cardNumber:', transaction.cardNumber);

          // NFCCard model uses cardNumber field
          const card = await NFCCard.findOne({ cardNumber: transaction.cardNumber });

          console.log('Found card:', card ? 'Yes' : 'No');
          if (card) {
            console.log('Card details:', {
              cardNumber: card.cardNumber,
              currentBalance: card.balance
            });
          } else {
            console.log('Card not found, listing all available cards...');
            const allCards = await NFCCard.find({}).limit(5);
            console.log('Available cards:', allCards.length);
            allCards.forEach(c => {
              console.log('Card:', {
                cardNumber: c.cardNumber,
                balance: c.balance,
                isActive: c.isActive
              });
            });
          }

          if (card) {
            // Add refund amount back to card balance
            card.balance = (card.balance || 0) + transaction.amount;
            await card.save();

            // Create refund transaction record
            const refundTransaction = new Transaction({
              bookingId: existing.bookingId || existing._id,
              userId: existing.userId,
              cardNumber: transaction.cardNumber,
              amount: transaction.amount,
              transactionType: 'refund',
              status: 'completed',
              paymentMethod: 'nfc_card',
              fromLocation: transaction.fromLocation || 'Booking Cancellation',
              toLocation: transaction.toLocation || 'Card Refund',
              meta: {
                originalTransactionId: transaction._id,
                refundReason: 'Booking cancellation',
                seatNumbers: existing.seatNumbers || [],
                travelDate: existing.travelDate || null,
                bus: {
                  id: existing.busId,
                  vehicleNumber: existing.busInfo?.vehicleNumber || ''
                }
              }
            });

            await refundTransaction.save();

            refundResult = {
              success: true,
              refundAmount: transaction.amount,
              newBalance: card.balance,
              refundTransactionId: refundTransaction._id
            };
            console.log('Refund successful:', refundResult);
          } else {
            refundResult = {
              success: false,
              error: 'Card not found for refund'
            };
            console.log('Refund failed - card not found');
          }
        } else {
          refundResult = {
            success: false,
            error: 'Original transaction not found'
          };
          console.log('Refund failed - transaction not found');
        }
      } catch (refundError) {
        console.error('Refund processing error:', refundError);
        refundResult = {
          success: false,
          error: 'Failed to process refund: ' + refundError.message
        };
      }
    }

    const updated = await Booking.findByIdAndUpdate(id, { $set: update }, { new: true })
      .populate('busId', 'vehicleNumber vehicleType')
      .populate('fromStopId', 'stopName')
      .populate('toStopId', 'stopName');

    return res.json({
      success: true,
      message: 'Booking cancelled' + (refundResult?.success ? ' and refund processed' : ''),
      data: updated,
      refund: refundResult
    });
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
