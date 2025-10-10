const router = require("express").Router();
let Bus = require("../models/RouteManagement/Bus");
let Route = require("../models/RouteManagement/Route");
let Schedule = require("../models/RouteManagement/Schedule");
let BusStop = require("../models/RouteManagement/BusStop");
let Booking = require("../models/Booking");

// POST - Search buses between two stops for a specific date
router.route("/buses").post(async (req, res) => {
    try {
        const { fromStopId, toStopId, travelDate } = req.body;

        if (!fromStopId || !toStopId || !travelDate) {
            return res.status(400).json({
                success: false,
                message: 'fromStopId, toStopId, and travelDate are required'
            });
        }

        // Find buses that serve the route between these stops
        const buses = await Bus.find({
            activeStatus: "On duty",
            status: { $ne: "Cancelled" }
        })
            .populate({
                path: 'route',
                select: 'stopsSequence',
                populate: {
                    path: 'stopsSequence',
                    select: 'stopName'
                }
            })
            .populate('schedule', 'departureTime arrivalTime')
            .lean();

        // Filter buses that pass through both stops
        const availableBuses = [];

        for (let bus of buses) {
            if (!bus.route || !Array.isArray(bus.route.stopsSequence)) continue;

            const fromIndex = bus.route.stopsSequence.findIndex(stopDoc =>
                (stopDoc._id || stopDoc).toString() === fromStopId
            );
            const toIndex = bus.route.stopsSequence.findIndex(stopDoc =>
                (stopDoc._id || stopDoc).toString() === toStopId
            );

            // Check if both stops exist and from comes before to
            if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
                // Calculate booked seats for this bus on travel date
                const bookings = await Booking.find({
                    busId: bus._id,
                    travelDate: new Date(travelDate),
                    bookingStatus: { $in: ['confirmed', 'completed'] }
                });

                let bookedSeatsCount = 0;
                bookings.forEach(booking => {
                    bookedSeatsCount += booking.seatNumbers.length;
                });

                const availableSeats = bus.avlSeats - bookedSeatsCount;

                // Calculate fare (you can customize this logic)
                const distance = toIndex - fromIndex;
                const baseFare = 50; // Base fare
                const farePerStop = 25; // Fare per stop
                const totalFare = baseFare + (distance * farePerStop);

                availableBuses.push({
                    busId: bus._id,
                    vehicleNumber: bus.vehicleNumber,
                    vehicleType: bus.vehicleType,
                    totalSeats: bus.avlSeats,
                    availableSeats: availableSeats,
                    bookedSeats: bookedSeatsCount,
                    fare: totalFare,
                    status: bus.status,
                    schedule: bus.schedule,
                    route: {
                        routeId: bus.route._id,
                        fromStop: bus.route.stopsSequence[fromIndex],
                        toStop: bus.route.stopsSequence[toIndex],
                        departureTime: bus.schedule?.departureTime || '00:00',
                        arrivalTime: bus.schedule?.arrivalTime || '00:00'
                    }
                });
            }
        }

        // Sort by departure time
        availableBuses.sort((a, b) => {
            const timeA = a.route.departureTime || '00:00';
            const timeB = b.route.departureTime || '00:00';
            return timeA.localeCompare(timeB);
        });

        res.json({
            success: true,
            data: {
                searchCriteria: {
                    fromStopId,
                    toStopId,
                    travelDate
                },
                totalBuses: availableBuses.length,
                buses: availableBuses
            }
        });

    } catch (error) {
        console.error('Error searching buses:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while searching buses'
        });
    }
});

// GET - Get bus stops for search dropdowns
router.route("/bus-stops").get(async (req, res) => {
    try {
        const { search } = req.query;

        let query = {};
        if (search) {
            query.stopName = { $regex: search, $options: 'i' };
        }

        const busStops = await BusStop.find(query)
            .select('stopName location')
            .sort({ stopName: 1 })
            .limit(50);

        res.json({
            success: true,
            data: busStops
        });

    } catch (error) {
        console.error('Error fetching bus stops:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching bus stops'
        });
    }
});

// GET - Get popular routes
router.route("/popular-routes").get(async (req, res) => {
    try {
        // Get most frequently booked routes
        const popularRoutes = await Booking.aggregate([
            {
                $match: {
                    bookingStatus: { $ne: 'cancelled' },
                    travelDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
                }
            },
            {
                $group: {
                    _id: {
                        fromStopId: '$fromStopId',
                        toStopId: '$toStopId'
                    },
                    bookingCount: { $sum: 1 }
                }
            },
            {
                $sort: { bookingCount: -1 }
            },
            {
                $limit: 10
            }
        ]);

        // Populate stop details
        const populatedRoutes = await Promise.all(
            popularRoutes.map(async (route) => {
                const fromStop = await BusStop.findById(route._id.fromStopId).select('stopName');
                const toStop = await BusStop.findById(route._id.toStopId).select('stopName');

                return {
                    fromStop: fromStop,
                    toStop: toStop,
                    bookingCount: route.bookingCount
                };
            })
        );

        res.json({
            success: true,
            data: populatedRoutes.filter(route => route.fromStop && route.toStop)
        });

    } catch (error) {
        console.error('Error fetching popular routes:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching popular routes'
        });
    }
});

module.exports = router;