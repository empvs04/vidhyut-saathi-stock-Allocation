import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let isConnected = false;

export async function connectDB() {
  if (isConnected) return mongoose.connection;

  const primaryUri = process.env.MONGODB_URI;
  const fallbackUri = process.env.FALLBACK_MONGODB_URI;

  try {
    console.log('Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return conn.connection;
  } catch (primaryErr) {
    console.warn('MongoDB Atlas connection failed:', primaryErr.message);
    if (fallbackUri) {
      try {
        console.log('Attempting local MongoDB fallback...');
        const conn = await mongoose.connect(fallbackUri, {
          serverSelectionTimeoutMS: 4000,
        });
        isConnected = true;
        console.log(`Local MongoDB Connected: ${conn.connection.host}`);
        return conn.connection;
      } catch (fallbackErr) {
        console.error('All MongoDB connection attempts failed:', fallbackErr.message);
      }
    }
    console.warn('Operating in offline cache mode if MongoDB is unavailable.');
    return null;
  }
}

export function getIsConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
