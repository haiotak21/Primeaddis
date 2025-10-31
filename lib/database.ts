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
  // eslint-disable-next-line no-var
  var __dbDownUntil: number | undefined
}

const cached: MongooseCache = global.__mongooseCache || { conn: null, promise: null }
if (!global.__mongooseCache) {
  global.__mongooseCache = cached
}

async function connectDB(): Promise<typeof mongoose> {
  // Disable Mongoose buffering globally so queries fail fast when disconnected
  try {
    mongoose.set("bufferCommands", false)
  } catch {}

  if (cached.conn) return cached.conn

  if (!cached.promise) {
    // Circuit breaker: if DB recently failed, skip attempts for a short window
    const now = Date.now()
    const downUntil = global.__dbDownUntil || 0
    if (now < downUntil) {
      throw new Error(
        `Database temporarily unavailable (circuit open for ${Math.ceil((downUntil - now) / 1000)}s)`
      )
    }

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
    const isSrv = (MONGODB_URI || "").startsWith("mongodb+srv://")
    const isAtlasHost = (() => {
      try {
        const u = new URL(MONGODB_URI)
        return /mongodb\.net$/i.test(u.hostname)
      } catch {
        return false
      }
    })()

    const isDev = (process.env.NODE_ENV || "development") !== "production"
  const opts: any = {
      // Keep bufferCommands false to avoid client-side buffering
      bufferCommands: false,
      // Tighter timeouts to avoid long dev hangs before fallback
      serverSelectionTimeoutMS: Number(
        process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || (isDev ? 8000 : 8000)
      ),
      connectTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS || (isDev ? 8000 : 8000)),
      socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS || (isDev ? 15000 : 20000)),
      family: 4, // prefer IPv4 to avoid some ISP/IPv6 issues
      // Only enable TLS by default for SRV/Atlas; for localhost it typically fails
      tls: isSrv || isAtlasHost,
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
    const uriLower = (MONGODB_URI || "").toLowerCase()
    const isLocal = uriLower.includes("localhost") || uriLower.includes("127.0.0.1")

    // Prefer in-memory in development when:
    // - explicitly requested via DB_IN_MEMORY or MONGODB_URI === "in-memory"
    // - OR in general dev mode unless explicitly forced to real DB
    // - OR URI looks like Atlas/SRV (likely to hang without whitelisting) and fallback isn't explicitly disabled
    // Only use in-memory when explicitly requested. Prefer connecting to the configured URI (Atlas)
    const useMemory =
      process.env.DB_IN_MEMORY === "true" ||
      process.env.DB_IN_MEMORY === "1" ||
      MONGODB_URI === "in-memory"

    if (useMemory) {
      cached.promise = startMemory().then(async (conn) => {
        console.log("✅ Connected to in-memory MongoDB (dev mode)")
        // Ensure all Mongoose models are registered once connected
        try {
          await import("@/models")
        } catch {}
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
        .then(async (conn) => {
          console.log("✅ MongoDB connected:", safeUri)
          // Ensure all Mongoose models are registered once connected
          try {
            await import("@/models")
          } catch {}
          return conn
        })
        .catch(async (err) => {
          console.error("❌ MongoDB connection failed:", err?.message || err)
          // Mark DB as down for a short period to avoid repeated long waits (default 15s)
          global.__dbDownUntil = Date.now() + Number(process.env.DB_CIRCUIT_BREAK_MS || 15000)
          // In development, fall back automatically to in-memory unless explicitly disabled.
          const allowFallback =
            ((process.env.NODE_ENV || "development") !== "production") &&
            process.env.DB_FALLBACK_MEMORY === "true"
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
  // Open circuit on error (default 15s)
  global.__dbDownUntil = Date.now() + Number(process.env.DB_CIRCUIT_BREAK_MS || 15000)
    throw e
  }

  return cached.conn
}

export { connectDB }
export default connectDB
