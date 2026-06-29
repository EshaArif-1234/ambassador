// @ts-nocheck
/**
 * Admin seed / password reset script.
 *
 * Create admin (first run):
 *   ADMIN_EMAIL=info@ambassador.pk ADMIN_PASSWORD='YourSecurePass1' npm run seed:admin
 *
 * Reset password (admin already exists):
 *   ADMIN_EMAIL=info@ambassador.pk ADMIN_PASSWORD='YourNewPass1' npm run seed:admin:reset
 *
 * Reads MONGO_URI from .env.local or .env
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? 'info@ambassador.pk').toLowerCase().trim();
const ADMIN_PASSWORD_FROM_ENV = process.env.ADMIN_PASSWORD?.trim();
const ADMIN_NAME = process.env.ADMIN_NAME ?? 'Ambassador Admin';
const ADMIN_PHONE = process.env.ADMIN_PHONE ?? '00000000000';
const RESET_PASSWORD = process.argv.includes('--reset-password');

function printUsage() {
  console.log(`
Admin seed usage:
  npm run seed:admin
    Creates the admin user if missing. Set ADMIN_PASSWORD in the environment.

  npm run seed:admin:reset
    Updates the password for an existing admin. Requires ADMIN_PASSWORD in the environment.

Environment variables:
  MONGO_URI        (required) MongoDB connection string
  ADMIN_EMAIL      (optional) default: info@ambassador.pk
  ADMIN_PASSWORD   (required) plain-text password — never commit this
  ADMIN_NAME       (optional)
  ADMIN_PHONE      (optional)
`);
}

async function upsertAdminPassword(col: mongoose.mongo.Collection, hashedPassword: string) {
  await col.updateOne(
    { email: ADMIN_EMAIL },
    {
      $set: {
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        authProvider: 'local',
        updatedAt: new Date(),
      },
    }
  );
}

async function seedAdmin() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not defined. Add it to .env.local or your hosting environment.');
    process.exit(1);
  }

  if (RESET_PASSWORD && !ADMIN_PASSWORD_FROM_ENV) {
    console.error('ADMIN_PASSWORD is required to reset an existing admin password.');
    console.error('Example: ADMIN_PASSWORD="YourNewPass1" npm run seed:admin:reset');
    process.exit(1);
  }

  const ADMIN_PASSWORD = ADMIN_PASSWORD_FROM_ENV || 'admin@123456';
  if (!ADMIN_PASSWORD_FROM_ENV) {
    console.warn('ADMIN_PASSWORD not set — using local development default.');
    console.warn('Set ADMIN_PASSWORD in the environment for production.\n');
  }

  if (ADMIN_PASSWORD.length < 8) {
    console.error('ADMIN_PASSWORD must be at least 8 characters.');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected.\n');

  const col = mongoose.connection.db.collection('users');
  const existing = await col.findOne({ email: ADMIN_EMAIL });
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const now = new Date();

  if (existing) {
    if (RESET_PASSWORD) {
      await upsertAdminPassword(col, hashedPassword);
      console.log(`Admin password updated for: ${ADMIN_EMAIL}`);
    } else if (existing.role !== 'admin') {
      await col.updateOne(
        { email: ADMIN_EMAIL },
        { $set: { role: 'admin', isVerified: true, updatedAt: now } }
      );
      console.log(`Promoted existing user to admin: ${ADMIN_EMAIL}`);
      console.log('To set a new password run: npm run seed:admin:reset');
    } else {
      console.log(`Admin already exists: ${ADMIN_EMAIL}`);
      console.log('Password was NOT changed.');
      console.log('To reset the password run: npm run seed:admin:reset');
    }

    await mongoose.disconnect();
    return;
  }

  await col.insertOne({
    fullName: ADMIN_NAME,
    email: ADMIN_EMAIL,
    phoneNumber: ADMIN_PHONE,
    address: '',
    password: hashedPassword,
    role: 'admin',
    isVerified: true,
    authProvider: 'local',
    isDisabled: false,
    createdAt: now,
    updatedAt: now,
  });

  console.log('Admin user created successfully!');
  console.log(`  Email: ${ADMIN_EMAIL}`);

  await mongoose.disconnect();
  console.log('Done.');
}

seedAdmin().catch((err) => {
  console.error('Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
