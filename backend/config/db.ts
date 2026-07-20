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

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not defined in environment variables.');

  if (!global._mongooseConn) {
    global._mongooseConn = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 2,
      })
      .catch((err) => {
        // Drop cached promise so the next request can retry (dev hot-reload / transient Atlas errors).
        global._mongooseConn = undefined;
        throw err;
      });
  }

  try {
    await global._mongooseConn;
  } catch (err) {
    global._mongooseConn = undefined;
    const message = err instanceof Error ? err.message : String(err);
    if (/whitelist|ServerSelectionError/i.test(message)) {
      throw new Error(
        'MongoDB Atlas connection failed. Add your current IP in Atlas → Network Access → Add IP Address (or use 0.0.0.0/0 for development), then restart the dev server.',
        { cause: err },
      );
    }
    throw err;
  }
};

export default connectDB;
