import { MongoClient, ServerApiVersion } from "mongodb";

// Check if we have a MongoDB URI
if (!process.env.MONGO_URI) {
  console.warn("Missing MONGO_URI environment variable");
  // Don't throw error to prevent build failures, but log warning
}

const uri = process.env.MONGO_URI || "";
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Important: these settings make MongoDB connections more reliable in serverless environments
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 0, // Allow the pool to shrink to 0 when not in use
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  retryWrites: true,
  retryReads: true,
};

// Create a MongoDB client once as a global variable
let client;
let clientPromise;

// Prevent multiple instances of Mongo Client in development mode
if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global;
  if (!globalWithMongo._mongoClientPromise && uri) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect().catch((err) => {
      console.error("MongoDB connection error:", err);
      return null;
    });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  if (uri) {
    client = new MongoClient(uri, options);
    clientPromise = client.connect().catch((err) => {
      console.error("MongoDB connection error:", err);
      return null;
    });
  } else {
    clientPromise = Promise.resolve(null);
  }
}

// Export a module-scoped MongoClient promise
export default clientPromise;
