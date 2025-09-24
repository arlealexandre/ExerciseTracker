const mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);