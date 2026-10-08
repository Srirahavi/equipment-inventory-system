/**
 * One-time migration:
 * 1. Drop the stale `email_1` unique index from the users collection
 * 2. Remove the `email` field from all existing user documents
 * 3. Re-seed all 3 default users with username + password
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_db';

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const usersCol = db.collection('users');

  // 1. Drop email index if it exists
  try {
    await usersCol.dropIndex('email_1');
    console.log('✓ Dropped email_1 index');
  } catch (e) {
    console.log('• email_1 index not found (already dropped or never existed)');
  }

  // 2. Remove email field from all documents
  await usersCol.updateMany({}, { $unset: { email: '' } });
  console.log('✓ Removed email field from all users');

  // 3. Delete all existing users and re-seed fresh
  await usersCol.deleteMany({});
  console.log('✓ Cleared old users');

  const defaultUsers = [
    { name: 'Colombo Hospital', username: 'institution', password: process.env.SEED_INSTITUTION_PASSWORD, role: 'institution' },
    { name: 'BMEU Officer',     username: 'bmeu',        password: process.env.SEED_BMEU_PASSWORD,        role: 'bmeu'        },
    { name: 'RDHS Officer',     username: 'rdhs',        password: process.env.SEED_RDHS_PASSWORD,        role: 'rdhs'        },
  ].filter(u => u.password);

  for (const u of defaultUsers) {
    const hashed = await bcrypt.hash(u.password, 10);
    await usersCol.insertOne({
      name:     u.name,
      username: u.username,
      password: hashed,
      role:     u.role,
    });
    console.log(`✓ Created user: ${u.username} (${u.role})`);
  }

  // 4. Create unique index on username
  await usersCol.createIndex({ username: 1 }, { unique: true });
  console.log('✓ Created unique index on username');

  console.log('\n✅ Migration complete.');
  console.log('   Users seeded. Check .env for configured passwords.');

  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
