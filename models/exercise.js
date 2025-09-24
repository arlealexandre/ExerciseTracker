const mongoose = require('mongoose');

let exerciseSchema = mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    date: Date
});

module.exports = mongoose.model('Exercise', exerciseSchema);