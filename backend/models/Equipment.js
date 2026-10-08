import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Medical equipment',
      'Electrical equipment',
      'A/C & Refrigerator',
      'Generator',
      'Furniture',
      'Photocopy',
      'IT',
      'Medical Furniture'
    ]
  },
  // Common fields
  date:       { type: Date,   required: true },
  book:       { type: String, required: true },
  pageNumber: { type: String, required: true },

  // Equipment detail fields
  name:         { type: String },  // selected from dropdown
  make:         { type: String },
  model:        { type: String },
  serialNumber: { type: String },
  count:        { type: Number },  // Furniture / Medical Furniture
  capacity:     { type: String },  // A/C & Refrigerator (BTU/ton) | Generator (kVA/kW)
}, { timestamps: true });

export default mongoose.model('Equipment', equipmentSchema);
