// @ts-nocheck
/**
 * Admin Seed Script — run once to create the admin user.
 * Usage: npm run seed:admin
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const ADMIN_EMAIL    = 'info@ambassador.pk';
const ADMIN_PASSWORD = 'admin@123456';
const ADMIN_NAME     = 'Ambassador Admin';
const ADMIN_PHONE    = '00000000000';

async function seedAdmin() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not defined in .env.local');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected.\n');

  const col = mongoose.connection.db.collection('users');

  const existing = await col.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    if (existing.role === 'admin') {
      console.log(`Admin already exists: ${ADMIN_EMAIL}`);
    } else {
      await col.updateOne(
        { email: ADMIN_EMAIL },
        { $set: { role: 'admin', isVerified: true } }
      );
      console.log(`Promoted existing user to admin: ${ADMIN_EMAIL}`);
    }
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const now = new Date();

  await col.insertOne({
    fullName:    ADMIN_NAME,
    email:       ADMIN_EMAIL,
    phoneNumber: ADMIN_PHONE,
    address:     '',
    password:    hashedPassword,
    role:        'admin',
    isVerified:  true,
    createdAt:   now,
    updatedAt:   now,
  });

  console.log('Admin user created successfully!');
  console.log(`  Email   : ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);

  await mongoose.disconnect();
  console.log('Done.');
}

seedAdmin().catch((err) => {
  console.error('Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
