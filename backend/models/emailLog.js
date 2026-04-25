const mongoose = require('mongoose');

const emailLogSchema = mongoose.Schema({
    subject: { type: String, required: true },
    message: { type: String, required: true },
    recipients: { type: Number, required: true },
    sentAt: { type: Date, default: Date.now }
});

const EmailLog = mongoose.model("EmailLog", emailLogSchema);
module.exports = EmailLog;