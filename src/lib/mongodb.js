import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/eliasdex";

if (!uri) {
  throw new Error(
    "Missing MONGODB_URI environment variable. " +
      "Supported formats: mongodb://localhost:27017/dbname or mongodb+srv://user:pass@cluster.mongodb.net/dbname",
  );
}

// Validate URI format
if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
  throw new Error(
    `Invalid MONGODB_URI format: "${uri}". ` + "Must start with 'mongodb://' (local) or 'mongodb+srv://' (Atlas)",
  );
}

console.log("[MongoDB] Connecting to:", uri.replace(/:[^@]*@/, ":***@")); // Log dengan password tersembunyi

const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2,
  retryWrites: true,
};

let client;
let clientPromise;

if (globalThis._mongoClientPromise) {
  clientPromise = globalThis._mongoClientPromise;
} else {
  try {
    client = new MongoClient(uri, options);
    clientPromise = client
      .connect()
      .then(() => {
        console.log("[MongoDB] Connected successfully");
        return client;
      })
      .catch((err) => {
        console.error("[MongoDB] Connection failed:", err.message);
        console.error("[MongoDB] Make sure MongoDB is running or check your MONGODB_URI in .env.local");
        // Throw error so caller knows connection failed
        throw err;
      });
    globalThis._mongoClientPromise = clientPromise;
  } catch (err) {
    console.error("[MongoDB] Client creation error:", err.message);
    throw err;
  }
}

export default clientPromise;
