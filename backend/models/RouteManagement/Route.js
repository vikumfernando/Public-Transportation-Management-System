const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const routeSchema = new Schema ({
    
    routeName: {
        type : String,
        required : true
    },

    routeNum : {
        type : Number,
        required : true
    },

    stopsSequence : [{
        
        type : mongoose.Schema.ObjectId,
        ref : "BusStop",
        required : true
    }],

    startFare : {
        type : Number,
        dafault : 0
    },

    distance : {
        type: Number,
        defualt : 0
    },

    duration : {
        type : Number,
        default : 0
    }
});

const Route = mongoose.model("Route", routeSchema);

module.exports = Route;