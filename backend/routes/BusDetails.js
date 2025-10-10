const router = require("express").Router();
let Bus = require("../models/RouteManagement/Bus");
let Route = require("../models/RouteManagement/Route");
let Schedule = require("../models/RouteManagement/Schedule");
let BusStop = require("../models/RouteManagement/BusStop");
let Booking = require("../models/Booking");

// GET - Get detailed information about a specific bus
router.route("/:busId").get(async (req, res) => {
    try {
        const { busId } = req.params;
        const { fromStopId, toStopId, travelDate } = req.query;

        if (!fromStopId || !toStopId || !travelDate) {
            return res.status(400).json({
                success: false,
                message: 'fromStopId, toStopId, and travelDate are required'
            });
        }

        // Get bus details with populated data
        const bus = await Bus.findById(busId)
            .populate({
                path: 'route',
                select: 'stopsSequence',
                populate: {
                    path: 'stopsSequence',
                    select: 'stopName'
                }
            })
            .populate('schedule');

        if (!bus) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found'
            });
        }

        // Find from and to stop details in route
        const fromIndex = bus.route.stopsSequence.findIndex(stopDoc =>
            (stopDoc._id || stopDoc).toString() === fromStopId
        );
        const toIndex = bus.route.stopsSequence.findIndex(stopDoc =>
            (stopDoc._id || stopDoc).toString() === toStopId
        );

        if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
            return res.status(400).json({
                success: false,
                message: 'Invalid route selection'
            });
        }

        // Get booking statistics for this bus on travel date
        const dayStart = new Date(new Date(travelDate).getFullYear(), new Date(travelDate).getMonth(), new Date(travelDate).getDate());
        const dayEnd = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate() + 1);
        const bookings = await Booking.find({
            busId: busId,
            travelDate: { $gte: dayStart, $lt: dayEnd },
            bookingStatus: { $in: ['confirmed', 'completed'] }
        });

        let bookedSeatsCount = 0;
        const bookedSeatNumbers = [];
        bookings.forEach(booking => {
            bookedSeatsCount += booking.seatNumbers.length;
            bookedSeatNumbers.push(...booking.seatNumbers);
        });

        // Calculate fare
        const distance = toIndex - fromIndex;
        const baseFare = 50;
        const farePerStop = 25;
        const totalFare = baseFare + (distance * farePerStop);

        // Get intermediate stops
        const intermediateStops = bus.route.stopsSequence.slice(fromIndex, toIndex + 1).map(stop => ({
            stopId: (stop._id || stop),
            stopName: stop.stopName || '',
            arrivalTime: null,
            departureTime: null,
            distance: 0
        }));

        // Calculate estimated travel duration
        const fromTime = bus.schedule?.departureTime || '00:00';
        const toTime = bus.schedule?.arrivalTime || '00:00';

        const busDetails = {
            busId: bus._id,
            vehicleNumber: bus.vehicleNumber,
            vehicleType: bus.vehicleType,
            totalSeats: bus.avlSeats,
            availableSeats: bus.avlSeats - bookedSeatsCount,
            bookedSeats: bookedSeatsCount,
            bookedSeatNumbers: bookedSeatNumbers,
            status: bus.status,
            activeStatus: bus.activeStatus,
            fare: totalFare,
            travelInfo: {
                fromStop: {
                    stopId: (bus.route.stopsSequence[fromIndex]._id || bus.route.stopsSequence[fromIndex]),
                    stopName: bus.route.stopsSequence[fromIndex].stopName || '',
                    departureTime: fromTime
                },
                toStop: {
                    stopId: (bus.route.stopsSequence[toIndex]._id || bus.route.stopsSequence[toIndex]),
                    stopName: bus.route.stopsSequence[toIndex].stopName || '',
                    arrivalTime: toTime
                },
                travelDate: travelDate,
                estimatedDuration: calculateDuration(fromTime, toTime),
                intermediateStops: intermediateStops
            },
            amenities: [
                'AC', 'WiFi', 'Charging Port', 'Reading Light'
            ], // You can add this to your Bus model
            policies: {
                cancellation: 'Free cancellation up to 2 hours before departure',
                refund: 'Refund processed within 3-5 business days',
                boardingPoint: 'Please arrive 15 minutes before departure'
            }
        };

        res.json({
            success: true,
            data: busDetails
        });

    } catch (error) {
        console.error('Error fetching bus details:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching bus details'
        });
    }
});

// Helper function to calculate duration between two times
function calculateDuration(startTime, endTime) {
    if (!startTime || !endTime) return 'N/A';

    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);

    let diff = end - start;
    if (diff < 0) diff += 24 * 60 * 60 * 1000; // Handle next day

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
}

// GET - Get bus reviews/ratings (if you want to add this feature)
router.route("/:busId/reviews").get(async (req, res) => {
    try {
        const { busId } = req.params;

        // You can implement a Review model later
        // For now, return mock data
        const reviews = [
            {
                userId: "user1",
                userName: "John Doe",
                rating: 4.5,
                comment: "Clean bus, on time departure",
                date: new Date()
            }
        ];

        res.json({
            success: true,
            data: {
                averageRating: 4.2,
                totalReviews: 150,
                reviews: reviews
            }
        });

    } catch (error) {
        console.error('Error fetching bus reviews:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching reviews'
        });
    }
});

// GET - Get live tracking info (if you want to add this feature)
router.route("/:busId/tracking").get(async (req, res) => {
    try {
        const { busId } = req.params;

        const bus = await Bus.findById(busId)
            .populate({
                path: 'route',
                populate: {
                    path: 'stops.stopId',
                    select: 'stopName'
                }
            });

        if (!bus) {
            return res.status(404).json({
                success: false,
                message: 'Bus not found'
            });
        }

        const trackingInfo = {
            busId: bus._id,
            vehicleNumber: bus.vehicleNumber,
            currentLocation: {
                lat: bus.lat,
                lon: bus.lon
            },
            status: bus.status,
            nextStopIndex: bus.nextStopIndex,
            nextStop: bus.route.stops[bus.nextStopIndex]?.stopId.stopName || 'Destination',
            estimatedArrival: '15 mins', // Calculate based on distance and speed
            lastUpdated: new Date()
        };

        res.json({
            success: true,
            data: trackingInfo
        });

    } catch (error) {
        console.error('Error fetching tracking info:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching tracking info'
        });
    }
});

module.exports = router;