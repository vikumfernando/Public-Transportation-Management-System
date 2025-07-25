const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const scheduleSchema = new Schema({

    routeId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Route"
    },

    dayType : {
        type: String
    },

    stopSchedules: [{

        stopId : {
            type: mongoose.Schema.Types.ObjectId,
            ref : "BusStop" //Check spelling
        },

        expectedArrival: {
            type : String,
            required : true
        },

        expectedDeparture: {
            type : String,
            required : true
        }

    }]
});

const Schedule = mongoose.model("Schedule", scheduleSchema);

module.exports = Schedule;