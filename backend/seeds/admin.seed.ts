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
 * Create manager only (admin already exists — does not touch admin):
 *   MANAGER_PASSWORD='YourManagerPass1' npm run create:manager
 *
 * Reset manager password:
 *   MANAGER_PASSWORD='YourNewPass1' npm run create:manager:reset
 *
 * Reads MONGO_URI from .env.local or .env
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import path from 'path';
import { MANAGER_EMAIL } from '../../utils/dashboardRoles';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? 'info@ambassador.pk').toLowerCase().trim();
const MANAGER_EMAIL_NORM = (process.env.MANAGER_EMAIL ?? MANAGER_EMAIL).toLowerCase().trim();
const ADMIN_PASSWORD_FROM_ENV = process.env.ADMIN_PASSWORD?.trim();
const MANAGER_PASSWORD_FROM_ENV = process.env.MANAGER_PASSWORD?.trim();
const ADMIN_NAME = process.env.ADMIN_NAME ?? 'Ambassador Admin';
const MANAGER_NAME = process.env.MANAGER_NAME ?? 'Dashboard Manager';
const ADMIN_PHONE = process.env.ADMIN_PHONE ?? '00000000000';
const MANAGER_PHONE = process.env.MANAGER_PHONE ?? '00000000000';
const RESET_PASSWORD = process.argv.includes('--reset-password');
const MANAGER_ONLY = process.argv.includes('--manager-only');
const RESET_MANAGER = process.argv.includes('--reset-manager-password');

function printUsage() {
  console.log(`
Admin seed usage:
  npm run seed:admin
    Creates the admin user if missing. Set ADMIN_PASSWORD in the environment.

  npm run seed:admin:reset
    Updates the password for an existing admin. Requires ADMIN_PASSWORD.

  npm run create:manager
    Creates the manager user only (does not change admin). Requires MANAGER_PASSWORD.

  npm run create:manager:reset
    Updates the manager password. Requires MANAGER_PASSWORD.

Environment variables:
  MONGO_URI        (required) MongoDB connection string
  ADMIN_EMAIL      (optional) default: info@ambassador.pk
  ADMIN_PASSWORD   (required for admin create/reset)
  MANAGER_EMAIL    (optional) default: halogix.seo@gmail.com
  MANAGER_PASSWORD (required for manager create/reset)
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
    },
  );
}

async function upsertManagerPassword(col: mongoose.mongo.Collection, hashedPassword: string) {
  await col.updateOne(
    { email: MANAGER_EMAIL_NORM },
    {
      $set: {
        password: hashedPassword,
        role: 'manager',
        isVerified: true,
        authProvider: 'local',
        updatedAt: new Date(),
      },
    },
  );
}

async function seedAdmin(col: mongoose.mongo.Collection, hashedPassword: string, now: Date) {
  const existing = await col.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    if (RESET_PASSWORD) {
      await upsertAdminPassword(col, hashedPassword);
      console.log(`Admin password updated for: ${ADMIN_EMAIL}`);
    } else if (existing.role !== 'admin') {
      await col.updateOne(
        { email: ADMIN_EMAIL },
        { $set: { role: 'admin', isVerified: true, updatedAt: now } },
      );
      console.log(`Promoted existing user to admin: ${ADMIN_EMAIL}`);
      console.log('To set a new password run: npm run seed:admin:reset');
    } else {
      console.log(`Admin already exists: ${ADMIN_EMAIL}`);
      console.log('Password was NOT changed.');
      console.log('To reset the password run: npm run seed:admin:reset');
    }
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
}

async function seedManager(col: mongoose.mongo.Collection, hashedPassword: string, now: Date) {
  const existing = await col.findOne({ email: MANAGER_EMAIL_NORM });

  if (existing) {
    if (existing.role === 'admin') {
      console.error(`Cannot downgrade admin account to manager: ${MANAGER_EMAIL_NORM}`);
      return;
    }
    if (RESET_MANAGER) {
      await upsertManagerPassword(col, hashedPassword);
      console.log(`Manager password updated for: ${MANAGER_EMAIL_NORM}`);
    } else if (existing.role !== 'manager') {
      await col.updateOne(
        { email: MANAGER_EMAIL_NORM },
        { $set: { role: 'manager', isVerified: true, updatedAt: now } },
      );
      console.log(`Promoted existing user to manager: ${MANAGER_EMAIL_NORM}`);
      console.log('To set a password run: npm run create:manager:reset');
    } else {
      console.log(`Manager already exists: ${MANAGER_EMAIL_NORM}`);
      console.log('Password was NOT changed.');
      console.log('To reset the password run: npm run create:manager:reset');
    }
    return;
  }

  await col.insertOne({
    fullName: MANAGER_NAME,
    email: MANAGER_EMAIL_NORM,
    phoneNumber: MANAGER_PHONE,
    address: '',
    password: hashedPassword,
    role: 'manager',
    isVerified: true,
    authProvider: 'local',
    isDisabled: false,
    createdAt: now,
    updatedAt: now,
  });

  console.log('Manager user created successfully!');
  console.log(`  Email: ${MANAGER_EMAIL_NORM}`);
}

async function main() {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not defined. Add it to .env.local or your hosting environment.');
    process.exit(1);
  }

  const runningManager = MANAGER_ONLY || RESET_MANAGER;

  if (runningManager) {
    if (!MANAGER_PASSWORD_FROM_ENV) {
      console.error('MANAGER_PASSWORD is required for manager create/reset.');
      process.exit(1);
    }
    if (MANAGER_PASSWORD_FROM_ENV.length < 8) {
      console.error('MANAGER_PASSWORD must be at least 8 characters.');
      process.exit(1);
    }
  } else {
    if (RESET_PASSWORD && !ADMIN_PASSWORD_FROM_ENV) {
      console.error('ADMIN_PASSWORD is required to reset an existing admin password.');
      process.exit(1);
    }
    const ADMIN_PASSWORD = ADMIN_PASSWORD_FROM_ENV || 'admin@123456';
    if (!ADMIN_PASSWORD_FROM_ENV) {
      console.warn('ADMIN_PASSWORD not set — using local development default.');
    }
    if (ADMIN_PASSWORD.length < 8) {
      console.error('ADMIN_PASSWORD must be at least 8 characters.');
      process.exit(1);
    }
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected.\n');

  const col = mongoose.connection.db.collection('users');
  const now = new Date();

  if (runningManager) {
    const managerHash = await bcrypt.hash(MANAGER_PASSWORD_FROM_ENV, 12);
    await seedManager(col, managerHash, now);
  } else {
    const ADMIN_PASSWORD = ADMIN_PASSWORD_FROM_ENV || 'admin@123456';
    const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await seedAdmin(col, adminHash, now);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
