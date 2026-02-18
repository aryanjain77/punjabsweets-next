import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __mongoose: MongooseCache | undefined;
}

const MONGO_URI = process.env.MONGO_URI ?? process.env.MONGODB_URI;

const options: mongoose.ConnectOptions = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  family: 4,
};

const cached: MongooseCache =
  global.__mongoose || (global.__mongoose = { conn: null, promise: null });

export async function connectDB(): Promise<typeof mongoose> {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI / MONGODB_URI is not defined");
  }

  // Fail fast on common Atlas misconfiguration that otherwise looks like a timeout.
  if (MONGO_URI.includes("replicaSet=atlas-xxxxx")) {
    throw new Error(
      "Invalid MongoDB URI: replicaSet is still 'atlas-xxxxx'. Use the exact Atlas connection string (prefer mongodb+srv://...) from MongoDB Atlas."
    );
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, options) // ✅ now TS knows it's string
      .then((m) => {
        cached.conn = m;
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  return cached.promise;
}

export default mongoose;
