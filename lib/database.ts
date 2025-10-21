import mongoose from "mongoose"

// Default to 127.0.0.1 to avoid IPv6 (::1) issues on some Windows setups
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/primeaddis"

export type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined
  // eslint-disable-next-line no-var
  var __mongoMemoryServer: any | undefined
}

const cached: MongooseCache = global.__mongooseCache || { conn: null, promise: null }
if (!global.__mongooseCache) {
  global.__mongooseCache = cached
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    const isProd = (process.env.NODE_ENV || "development") === "production"
    // Ensure a default dbName if URI has no database segment (for some Atlas URIs)
    const parsed = (() => {
      try {
        return new URL(MONGODB_URI);
      } catch {
        return null;
      }
    })();
    const hasDbInUri = !!parsed && parsed.pathname && parsed.pathname !== "/";
    const opts: any = {
      bufferCommands: false,
      serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 10000),
      ...(hasDbInUri ? {} : { dbName: "primeaddis" }),
    }

    // In production, hard-fail if clearly configured for local or in-memory DB
    if (isProd) {
      const uriLower = (MONGODB_URI || "").toLowerCase()
      const isLocal = uriLower.includes("localhost") || uriLower.includes("127.0.0.1")
      const isInMemory = uriLower === "in-memory"
      if (isLocal || isInMemory) {
        throw new Error("MONGODB_URI is pointing to a local or in-memory DB in production. Please set it to your Atlas URI.")
      }
    }

    const startMemory = async () => {
      if (!global.__mongoMemoryServer) {
        const { MongoMemoryServer } = await import("mongodb-memory-server")
        global.__mongoMemoryServer = await MongoMemoryServer.create()
      }
      const memUri = global.__mongoMemoryServer.getUri()
      console.warn("⚠️ Using in-memory MongoDB at:", memUri)
      return mongoose.connect(memUri, opts)
    }

    // Prefer in-memory DB when explicitly requested OR when dev fallback is enabled
    // This avoids long timeouts when Atlas is unreachable during local development.
    const useMemory =
      process.env.DB_IN_MEMORY === "true" ||
      process.env.DB_IN_MEMORY === "1" ||
      MONGODB_URI === "in-memory" ||
      (((process.env.NODE_ENV || "development") !== "production") &&
        (process.env.DB_FALLBACK_MEMORY === "true" || process.env.DB_FALLBACK_MEMORY === "1"))

    if (useMemory) {
      cached.promise = startMemory().then((conn) => {
        console.log("✅ Connected to in-memory MongoDB (dev mode)")
        return conn
      })
    } else {
      const safeUri = (() => {
        try {
          // Mask password in logs: mongodb[+srv]://user:****@host/db
          return MONGODB_URI.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/, "$1****$3")
        } catch {
          return "<sanitized>"
        }
      })()

      cached.promise = mongoose
        .connect(MONGODB_URI, opts)
        .then((conn) => {
          console.log("✅ MongoDB connected:", safeUri)
          return conn
        })
        .catch(async (err) => {
          console.error("❌ MongoDB connection failed:", err?.message || err)
          const allowFallback =
            ((process.env.NODE_ENV || "development") !== "production") &&
            (process.env.DB_FALLBACK_MEMORY === "true" || process.env.DB_FALLBACK_MEMORY === "1")
          if (allowFallback) {
            console.warn("🔁 Falling back to in-memory MongoDB (dev fallback)")
            return startMemory()
          }
          throw err
        })
    }
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export { connectDB }
export default connectDB
