import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import authRoutes from './routes/authRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);

// Seed default users — passwords come from environment variables, never hardcoded
const seedUsers = async () => {
  try {
    const defaultUsers = [
      { name: 'Colombo Hospital', username: 'institution', password: process.env.SEED_INSTITUTION_PASSWORD, role: 'institution' },
      { name: 'BMEU Officer',     username: 'bmeu',        password: process.env.SEED_BMEU_PASSWORD,        role: 'bmeu'        },
      { name: 'RDHS Officer',     username: 'rdhs',        password: process.env.SEED_RDHS_PASSWORD,        role: 'rdhs'        }
    ].filter(u => u.password); // skip users whose password isn't configured

    for (const u of defaultUsers) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      await User.findOneAndUpdate(
        { username: u.username },
        { name: u.name, username: u.username, password: hashedPassword, role: u.role },
        { upsert: true, returnDocument: 'after' }
      );
      console.log(`✓ Seeded: ${u.username}`);
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_db')
  .then(async () => {
    console.log('MongoDB Connected');
    await seedUsers();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.log(err));
