// backend/src/models/Environment.js
const mongoose = require('mongoose');

// Each environment (development, staging, production) stores a set of key‑value pairs.
// Values are stored as a mixed object to allow any string value.
const EnvironmentSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, enum: ['development', 'staging', 'production'], required: true },
  values: { type: Map, of: String, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Environment', EnvironmentSchema);
