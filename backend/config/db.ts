import mongoose from 'mongoose';

/**
 * Proper serverless-safe connection cache.
 * A plain module-level boolean breaks on Vercel/serverless where each
 * invocation may reuse a warm lambda (needs the cached connection) or
 * spin up a fresh one (needs to connect). Storing the promise on the
 * Node.js global object survives hot-reloads in dev and warm-starts in prod.
 */
declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: Promise<typeof mongoose> | undefined;
}

const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState >= 1) return; // already connected / connecting

  if (!global._mongooseConn) {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is not defined in environment variables.');

    global._mongooseConn = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS:          45000,
      maxPoolSize:              10,      // reuse up to 10 sockets across requests
      minPoolSize:              2,
    });
  }

  await global._mongooseConn;
};

export default connectDB;
