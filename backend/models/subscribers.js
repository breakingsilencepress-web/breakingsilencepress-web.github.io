const mongoose = require('mongoose');

const subscriberSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    },
    verified: {
    type: Boolean,
    default: false
    },
    verificationToken: {
        type: String
    }
})

const Subscriber = mongoose.model("Subscriber", subscriberSchema);
module.exports = Subscriber;
