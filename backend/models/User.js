import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },                            // Institution / officer display name
  username: { type: String, required: true, unique: true },              // Login username
  password: { type: String, required: true },
  role:     { type: String, enum: ['institution', 'bmeu', 'rdhs'], required: true }
});

export default mongoose.model('User', userSchema);
