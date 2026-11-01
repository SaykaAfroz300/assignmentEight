import { MongoClient, ObjectId, type Collection, type Db, type Document } from "mongodb";
import { env } from "./env.js";
import { seedDatabaseIfNeeded } from "../models/seedData.js";

let client: MongoClient | null = null;
let db: Db | null = null;

/** Matches a single document against a MongoDB filter (used only for the local dev fallback when MONGODB_URI is empty). */
function matchesFilter(doc: Record<string, unknown>, filter: Record<string, unknown> = {}): boolean {
  for (const [key, cond] of Object.entries(filter)) {
    if (cond === undefined) continue;
    if (key === "$or" && Array.isArray(cond)) {
      if (!cond.some((sub) => matchesFilter(doc, sub as Record<string, unknown>))) return false;
      continue;
    }
    const val = doc[key];
    if (cond instanceof ObjectId) {
      if (String(val) !== String(cond)) return false;
    } else if (cond instanceof RegExp) {
      const target = Array.isArray(val) ? val.join(" ") : String(val ?? "");
      if (!cond.test(target)) return false;
    } else if (cond && typeof cond === "object" && !Array.isArray(cond)) {
      const ops = cond as Record<string, unknown>;
      if ("$regex" in ops) {
        const re = new RegExp(String(ops.$regex), String(ops.$options ?? ""));
        const target = Array.isArray(val) ? val.join(" ") : String(val ?? "");
        if (!re.test(target)) return false;
      }
      if ("$lt" in ops && !(Number(val) < Number(ops.$lt))) return false;
      if ("$lte" in ops && !(Number(val) <= Number(ops.$lte))) return false;
      if ("$gt" in ops && !(Number(val) > Number(ops.$gt))) return false;
      if ("$gte" in ops && !(Number(val) >= Number(ops.$gte))) return false;
      if ("$ne" in ops && val === ops.$ne) return false;
      if ("$in" in ops && Array.isArray(ops.$in)) {
        const list = ops.$in.map(String);
        if (Array.isArray(val)) {
          if (!val.some((v) => list.includes(String(v)))) return false;
        } else if (!list.includes(String(val))) {
          return false;
        }
      }
    } else if (Array.isArray(val)) {
      if (!val.includes(cond)) return false;
    } else if (String(val) !== String(cond)) {
      return false;
    }
  }
  return true;
}

function createInMemoryDb(): Db {
  const store = new Map<string, Record<string, unknown>[]>();
  const getRows = (name: string) => {
    if (!store.has(name)) store.set(name, []);
    return store.get(name)!;
  };

  return {
    collection(name: string) {
      const rows = getRows(name);
      return {
        async createIndex() {
          return "ok";
        },
        async countDocuments(filter: Record<string, unknown> = {}) {
          return rows.filter((r) => matchesFilter(r, filter)).length;
        },
        find(filter: Record<string, unknown> = {}) {
          let result = rows.filter((r) => matchesFilter(r, filter)).map((r) => ({ ...r }));
          const cursor = {
            sort(spec: Record<string, 1 | -1>) {
              const entries = Object.entries(spec);
              result.sort((a, b) => {
                for (const [k, dir] of entries) {
                  const av = a[k] as string | number;
                  const bv = b[k] as string | number;
                  if (av === bv) continue;
                  return (av > bv ? 1 : -1) * dir;
                }
                return 0;
              });
              return cursor;
            },
            limit(n: number) {
              result = result.slice(0, n);
              return cursor;
            },
            async toArray() {
              return result;
            },
          };
          return cursor;
        },
        async findOne(filter: Record<string, unknown> = {}) {
          const found = rows.find((r) => matchesFilter(r, filter));
          return found ? { ...found } : null;
        },
        async insertOne(doc: Record<string, unknown>) {
          const _id = (doc._id as ObjectId) ?? new ObjectId();
          const record = { ...doc, _id };
          rows.push(record);
          return { acknowledged: true, insertedId: _id };
        },
        async insertMany(docs: Record<string, unknown>[]) {
          for (const d of docs) {
            rows.push({ ...d, _id: (d._id as ObjectId) ?? new ObjectId() });
          }
          return { acknowledged: true, insertedCount: docs.length };
        },
        async updateOne(filter: Record<string, unknown>, update: { $set?: Record<string, unknown> }) {
          const idx = rows.findIndex((r) => matchesFilter(r, filter));
          if (idx === -1) return { matchedCount: 0, modifiedCount: 0 };
          rows[idx] = { ...rows[idx], ...(update.$set ?? {}) };
          return { matchedCount: 1, modifiedCount: 1 };
        },
        async findOneAndUpdate(
          filter: Record<string, unknown>,
          update: { $set?: Record<string, unknown> },
          _opts?: unknown
        ) {
          const idx = rows.findIndex((r) => matchesFilter(r, filter));
          if (idx === -1) return null;
          rows[idx] = { ...rows[idx], ...(update.$set ?? {}) };
          return { ...rows[idx] };
        },
        async deleteOne(filter: Record<string, unknown>) {
          const idx = rows.findIndex((r) => matchesFilter(r, filter));
          if (idx === -1) return { deletedCount: 0 };
          rows.splice(idx, 1);
          return { deletedCount: 1 };
        },
        async deleteMany(filter: Record<string, unknown>) {
          const before = rows.length;
          const remaining = rows.filter((r) => !matchesFilter(r, filter));
          rows.length = 0;
          rows.push(...remaining);
          return { deletedCount: before - remaining.length };
        },
      };
    },
  } as unknown as Db;
}

/** Opens (once) and returns the shared MongoDB database handle. Safe for serverless reuse. */
export async function connectDB(): Promise<Db> {
  if (db) return db;

  if (env.mongoUri) {
    try {
      client = new MongoClient(env.mongoUri, { maxPoolSize: 10, serverSelectionTimeoutMS: 6000 });
      await client.connect();
      db = client.db(env.dbName);
      await ensureIndexes(db);
      await seedDatabaseIfNeeded(db);
      return db;
    } catch (err) {
      if (env.isProd) throw err;
      console.warn("[StudioSpace] Could not connect to MONGODB_URI, falling back to local dev store:", err);
    }
  } else {
    console.warn("[StudioSpace] MONGODB_URI is empty — using seeded local dev store until MONGODB_URI is set.");
  }

  db = createInMemoryDb();
  await seedDatabaseIfNeeded(db);
  return db;
}

export async function getCollection<T extends Document = Document>(
  name: "studios" | "bookings" | "wishlists" | "reviews"
): Promise<Collection<T>> {
  const database = await connectDB();
  return database.collection<T>(name);
}

/** Indexes power filtering, ownership lookups, and the double-booking overlap query. */
async function ensureIndexes(database: Db) {
  await Promise.all([
    database.collection("studios").createIndex({ ownerEmail: 1 }),
    database.collection("studios").createIndex({ category: 1, createdAt: -1 }),
    database.collection("studios").createIndex({ title: "text", location: "text", overview: "text" }),
    database.collection("bookings").createIndex({ studioId: 1, status: 1, date: 1 }),
    database.collection("bookings").createIndex({ userEmail: 1, createdAt: -1 }),
    database.collection("wishlists").createIndex({ userEmail: 1, studioId: 1 }, { unique: true }),
  ]);
}

export async function closeDB() {
  await client?.close();
  client = null;
  db = null;
}
