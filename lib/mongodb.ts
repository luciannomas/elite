import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/seguimiento-elite';

type GlobalWithMongoose = typeof globalThis & {
  mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
  mongoDBAvailable?: boolean;
};
const g = global as GlobalWithMongoose;
if (!g.mongoose) g.mongoose = { conn: null, promise: null };
if (g.mongoDBAvailable === undefined) g.mongoDBAvailable = true;
let cached = g.mongoose;

async function connectDB() {
  if ((global as any).mongoDBAvailable === false) return null;
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false, serverSelectionTimeoutMS: 5000 })
      .then((m) => { (global as any).mongoDBAvailable = true; console.log('✅ MongoDB conectado'); return m; })
      .catch((err) => { (global as any).mongoDBAvailable = false; console.log('⚠️ MongoDB no disponible:', err.message); cached.promise = null; return null as any; });
  }
  try { cached.conn = await cached.promise; } catch { cached.promise = null; (global as any).mongoDBAvailable = false; }
  return cached.conn;
}

export function isMongoDBAvailable() { return (global as any).mongoDBAvailable !== false; }
export default connectDB;
