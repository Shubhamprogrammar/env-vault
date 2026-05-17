const mongoose = require('mongoose');

const envVariableSchema = new mongoose.Schema({
  key: { type: String, required: true },
  encryptedValue: { type: String, required: true },
  iv: { type: String, required: true },
  authTag: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

const environmentSchema = new mongoose.Schema({
  name: { type: String, enum: ['development', 'staging', 'production'], required: true },
  variables: [envVariableSchema],
});

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String },
  themes: {
    primary: { type: String, default: '#1E40AF' }, // default Tailwind indigo-900
    secondary: { type: String, default: '#10B981' }, // green-500
    accent: { type: String, default: '#F59E0B' }, // amber-500
  },
  environments: [environmentSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Project', projectSchema);
