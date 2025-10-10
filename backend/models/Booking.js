const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const seatBookingSchema = new Schema({
    bookingId: {
        type: String,
        unique: true,
        required: true
    },
    busId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bus",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    seatNumbers: [{
        type: String,
        required: true
    }],
    fromStopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BusStop",
        required: true
    },
    toStopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BusStop",
        required: true
    },
    passengerDetails: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        age: {
            type: Number,
            required: true,
            min: 1,
            max: 100
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other']
        },
        phone: {
            type: String,
            trim: true,
            validate: {
                validator: function (v) {
                    if (!v) return true; // optional
                    return /^(\+\d{1,3}[- ]?)?\d{10}$/.test(v);
                },
                message: 'Please enter a valid passenger phone number'
            }
        }
    }],
    totalFare: {
        type: Number,
        required: true
    },
    contactInfo: {
        email: {
            type: String,
            trim: true,
            lowercase: true,
            validate: {
                validator: function (v) {
                    if (!v) return true; // optional
                    return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(v);
                },
                message: 'Please enter a valid contact email address'
            }
        },
        phone: {
            type: String,
            trim: true,
            validate: {
                validator: function (v) {
                    if (!v) return true; // optional
                    return /^(\+\d{1,3}[- ]?)?\d{10}$/.test(v);
                },
                message: 'Please enter a valid contact phone number'
            }
        }
    },
    bookingStatus: {
        type: String,
        enum: ['confirmed', 'cancelled', 'completed'],
        default: 'confirmed'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    travelDate: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});


// Ensure bookingId is set BEFORE validation runs
seatBookingSchema.pre('validate', function (next) {
    if (this.isNew && !this.bookingId) {
        this.bookingId = 'BK' + Date.now() + Math.floor(Math.random() * 1000);
    }
    next();
});


seatBookingSchema.index({ busId: 1, travelDate: 1 });
seatBookingSchema.index({ userId: 1 });
seatBookingSchema.index({ bookingId: 1 });
seatBookingSchema.index({ 'contactInfo.email': 1 });

const Booking = mongoose.model("Booking", seatBookingSchema);
module.exports = Booking;