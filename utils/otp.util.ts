import bcrypt from 'bcryptjs';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

/** Generate a random 6-digit OTP. */
export const generateOtp = (): string => {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

/** Hash an OTP for safe storage. */
export const hashOtp = (plain: string): Promise<string> => bcrypt.hash(plain, 10);

/** Compare a plain OTP against its stored hash. */
export const verifyOtp = (plain: string, hashed: string): Promise<boolean> =>
  bcrypt.compare(plain, hashed);

/** Return a Date that is OTP_EXPIRY_MINUTES from now. */
export const otpExpiry = (): Date =>
  new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
