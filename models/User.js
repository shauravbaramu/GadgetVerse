const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
  first_name: { type: String, required: true },
  last_name: { type: String },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  resetPasswordToken: { type: String, default: null},
  resetPasswordExpires: {type: Date, default: null },
},
{ timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
