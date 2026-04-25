const mongoose = require('mongoose');

const evidenceSchema = mongoose.Schema({
    qrCode: String,
    chapter: String,
    heading: String,
    date: Date,
    description: String,
    downloadUrl: String,
    readUrl: String,
    source: String,
    fileType: String,
    copyRightStatus: String,
    downloadDate: String,
    originalUrl: String,
    moreDescription: String,
    relevance: String
})

const Evidence = mongoose.model("Evidence", evidenceSchema);
module.exports = Evidence;
