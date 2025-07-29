const mongoose = require('mongoose');

const ipLimitSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  lastAccess: { type: String } // 'YYYY-MM-DD'
});

module.exports = mongoose.model('IPLimit', ipLimitSchema);
