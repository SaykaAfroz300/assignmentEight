import { MongoClient, ObjectId, type Db } from "mongodb";

/**
 * Shared MongoDB handle for BetterAuth (users / sessions / accounts live in the same Atlas
 * database as the Express API's studios & bookings).
 * Includes an automatic fallback if MONGODB_URI is empty or unreachable (e.g., Atlas IP whitelist),
 * ensuring authentication never crashes in local development.
 */
const globalForMongo = globalThis as unknown as {
  __studioMongo?: MongoClient;
  __studioFallbackDb?: Db;
  __studioAtlasHealthy?: boolean;
};

const uri = process.env.MONGODB_URI?.trim().replace(/<([^>]+)>/g, "$1");

function toIdString(val: unknown): string {
  if (val instanceof ObjectId) return val.toHexString();
  return String(val ?? "");
}

function toComparable(val: unknown): number {
  if (val instanceof Date) return val.getTime();
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const n = Number(val);
    if (!Number.isNaN(n)) return n;
    const d = Date.parse(val);
    if (!Number.isNaN(d)) return d;
  }
  return Number(val);
}

function matchCondition(doc: Record<string, unknown>, cond: Record<string, unknown>): boolean {
  for (const [key, expected] of Object.entries(cond)) {
    if (key === "$and" && Array.isArray(expected)) {
      if (!expected.every((sub) => matchCondition(doc, sub as Record<string, unknown>))) return false;
      continue;
    }
    if (key === "$or" && Array.isArray(expected)) {
      if (!expected.some((sub) => matchCondition(doc, sub as Record<string, unknown>))) return false;
      continue;
    }
    if (key === "$nor" && Array.isArray(expected)) {
      if (expected.some((sub) => matchCondition(doc, sub as Record<string, unknown>))) return false;
      continue;
    }
    if (key === "$expr") continue;

    const actual = doc[key];
    if (expected instanceof ObjectId || actual instanceof ObjectId) {
      if (toIdString(actual) !== toIdString(expected)) return false;
      continue;
    }
    if (expected && typeof expected === "object" && !Array.isArray(expected) && !(expected instanceof Date)) {
      const ops = expected as Record<string, unknown>;
      if ("$regex" in ops) {
        const re = new RegExp(String(ops.$regex), String(ops.$options ?? ""));
        if (!re.test(String(actual ?? ""))) return false;
        continue;
      }
      if ("$not" in ops && ops.$not && typeof ops.$not === "object") {
        const notOps = ops.$not as Record<string, unknown>;
        if ("$regex" in notOps) {
          const re = new RegExp(String(notOps.$regex), String(notOps.$options ?? ""));
          if (re.test(String(actual ?? ""))) return false;
          continue;
        }
      }
      if ("$in" in ops && Array.isArray(ops.$in)) {
        const list = ops.$in.map(toIdString);
        if (!list.includes(toIdString(actual))) return false;
        continue;
      }
      if ("$nin" in ops && Array.isArray(ops.$nin)) {
        const list = ops.$nin.map(toIdString);
        if (list.includes(toIdString(actual))) return false;
        continue;
      }
      if ("$ne" in ops && toIdString(actual) === toIdString(ops.$ne)) return false;
      if ("$gt" in ops && !(toComparable(actual) > toComparable(ops.$gt))) return false;
      if ("$gte" in ops && !(toComparable(actual) >= toComparable(ops.$gte))) return false;
      if ("$lt" in ops && !(toComparable(actual) < toComparable(ops.$lt))) return false;
      if ("$lte" in ops && !(toComparable(actual) <= toComparable(ops.$lte))) return false;
    } else if (actual !== expected && toIdString(actual) !== toIdString(expected)) {
      return false;
    }
  }
  return true;
}

function createFallbackAuthDb(): Db {
  const store = new Map<string, Record<string, unknown>[]>();
  const getCol = (name: string) => {
    if (!store.has(name)) store.set(name, []);
    return store.get(name)!;
  };

  return {
    collection(name: string) {
      const rows = getCol(name);
      return {
        async createIndex() {
          return "ok";
        },
        async insertOne(doc: Record<string, unknown>) {
          const _id = doc._id instanceof ObjectId ? doc._id : new ObjectId();
          const saved = { ...doc, _id };
          rows.push(saved);
          return { acknowledged: true, insertedId: _id };
        },
        async findOne(filter: Record<string, unknown> = {}) {
          const found = rows.find((r) => matchCondition(r, filter));
          return found ? { ...found } : null;
        },
        aggregate(pipeline: Record<string, unknown>[] = []) {
          return {
            async toArray() {
              let result = rows.map((r) => ({ ...r }));
              for (const stage of pipeline) {
                if ("$match" in stage) {
                  result = result.filter((r) =>
                    matchCondition(r, (stage.$match as Record<string, unknown>) ?? {})
                  );
                } else if ("$lookup" in stage) {
                  const lk = stage.$lookup as {
                    from: string;
                    localField?: string;
                    foreignField?: string;
                    let?: { localFieldValue?: string };
                    pipeline?: Record<string, unknown>[];
                    as: string;
                  };
                  let resolvedLocalField = lk.localField;
                  let resolvedForeignField = lk.foreignField;
                  let subLimit: number | undefined;

                  if (!resolvedLocalField && lk.let?.localFieldValue) {
                    resolvedLocalField = lk.let.localFieldValue.replace(/^\$/, "");
                  }
                  if (Array.isArray(lk.pipeline)) {
                    for (const subStage of lk.pipeline) {
                      const exprEq = (
                        (subStage.$match as Record<string, unknown> | undefined)?.$expr as
                          | Record<string, unknown>
                          | undefined
                      )?.$eq;
                      if (Array.isArray(exprEq)) {
                        const fieldRef = exprEq.find(
                          (item) => typeof item === "string" && item.startsWith("$") && !item.startsWith("$$")
                        );
                        if (typeof fieldRef === "string") {
                          resolvedForeignField = fieldRef.replace(/^\$/, "");
                        }
                      }
                      if ("$limit" in subStage) {
                        subLimit = Number(subStage.$limit);
                      }
                    }
                  }

                  const foreignRows = getCol(lk.from);
                  result = result.map((doc) => {
                    const localVal = toIdString(doc[resolvedLocalField ?? "_id"]);
                    let matches = foreignRows.filter(
                      (fr) => toIdString(fr[resolvedForeignField ?? "_id"]) === localVal
                    );
                    if (subLimit !== undefined && subLimit > 0) {
                      matches = matches.slice(0, subLimit);
                    }
                    return { ...doc, [lk.as]: matches.map((m) => ({ ...m })) };
                  });
                } else if ("$unwind" in stage) {
                  const uw = stage.$unwind as { path: string } | string;
                  const pathKey = (typeof uw === "string" ? uw : uw.path).replace(/^\$/, "");
                  result = result.map((doc) => {
                    const arr = doc[pathKey];
                    return { ...doc, [pathKey]: Array.isArray(arr) ? arr[0] ?? null : arr };
                  });
                } else if ("$sort" in stage) {
                  const sortSpec = stage.$sort as Record<string, 1 | -1>;
                  result.sort((a, b) => {
                    for (const [k, dir] of Object.entries(sortSpec)) {
                      if (a[k] === b[k]) continue;
                      return ((a[k] as number) > (b[k] as number) ? 1 : -1) * dir;
                    }
                    return 0;
                  });
                } else if ("$skip" in stage) {
                  result = result.slice(Number(stage.$skip));
                } else if ("$limit" in stage) {
                  result = result.slice(0, Number(stage.$limit));
                } else if ("$count" in stage) {
                  const countKey = String(stage.$count);
                  return result.length > 0 ? [{ [countKey]: result.length }] : [];
                }
              }
              return result;
            },
          };
        },
        async findOneAndUpdate(
          filter: Record<string, unknown>,
          update: { $set?: Record<string, unknown>; $inc?: Record<string, number> }
        ) {
          const idx = rows.findIndex((r) => matchCondition(r, filter));
          if (idx === -1) return { value: null };
          const updated: Record<string, unknown> = { ...rows[idx], ...(update.$set ?? {}) };
          if (update.$inc) {
            for (const [k, v] of Object.entries(update.$inc)) {
              updated[k] = Number(updated[k] ?? 0) + v;
            }
          }
          rows[idx] = updated;
          return { value: { ...updated } };
        },
        async updateMany(filter: Record<string, unknown>, update: { $set?: Record<string, unknown> }) {
          let count = 0;
          for (let i = 0; i < rows.length; i++) {
            if (matchCondition(rows[i], filter)) {
              rows[i] = { ...rows[i], ...(update.$set ?? {}) };
              count++;
            }
          }
          return { modifiedCount: count };
        },
        async deleteOne(filter: Record<string, unknown>) {
          const idx = rows.findIndex((r) => matchCondition(r, filter));
          if (idx === -1) return { deletedCount: 0 };
          rows.splice(idx, 1);
          return { deletedCount: 1 };
        },
        async deleteMany(filter: Record<string, unknown>) {
          const before = rows.length;
          const kept = rows.filter((r) => !matchCondition(r, filter));
          rows.length = 0;
          rows.push(...kept);
          return { deletedCount: before - kept.length };
        },
        async findOneAndDelete(filter: Record<string, unknown>) {
          const idx = rows.findIndex((r) => matchCondition(r, filter));
          if (idx === -1) return { value: null };
          const [removed] = rows.splice(idx, 1);
          return { value: removed };
        },
      };
    },
  } as unknown as Db;
}

export const mongoClient = uri
  ? globalForMongo.__studioMongo ??
    new MongoClient(uri, { serverSelectionTimeoutMS: 4000, maxPoolSize: 10 })
  : null;

if (uri && mongoClient && process.env.NODE_ENV !== "production") {
  globalForMongo.__studioMongo = mongoClient;
}

const fallbackDb = (globalForMongo.__studioFallbackDb ??= createFallbackAuthDb());
const realDb = mongoClient ? mongoClient.db(process.env.DB_NAME || "studiospace") : null;

function createResilientAuthDb(): Db {
  if (!realDb) return fallbackDb;

  return {
    collection(name: string) {
      if (globalForMongo.__studioAtlasHealthy === false) {
        return fallbackDb.collection(name);
      }
      const primary = realDb.collection(name);
      const backup = fallbackDb.collection(name);

      const wrapAsync = <T extends (...args: never[]) => Promise<unknown>>(
        fn: T,
        backupFn: T
      ): T =>
        (async (...args: Parameters<T>) => {
          try {
            const res = await fn(...args);
            globalForMongo.__studioAtlasHealthy = true;
            return res;
          } catch (err) {
            console.warn(
              `[StudioSpace Auth] MongoDB Atlas unreachable (${(err as Error)?.message}), using local fallback store.`
            );
            globalForMongo.__studioAtlasHealthy = false;
            return backupFn(...args);
          }
        }) as T;

      return {
        createIndex: wrapAsync(
          primary.createIndex.bind(primary),
          backup.createIndex.bind(backup)
        ),
        insertOne: wrapAsync(primary.insertOne.bind(primary), backup.insertOne.bind(backup)),
        findOne: wrapAsync(primary.findOne.bind(primary), backup.findOne.bind(backup)),
        findOneAndUpdate: wrapAsync(
          primary.findOneAndUpdate.bind(primary),
          backup.findOneAndUpdate.bind(backup)
        ),
        updateMany: wrapAsync(primary.updateMany.bind(primary), backup.updateMany.bind(backup)),
        deleteOne: wrapAsync(primary.deleteOne.bind(primary), backup.deleteOne.bind(backup)),
        deleteMany: wrapAsync(primary.deleteMany.bind(primary), backup.deleteMany.bind(backup)),
        findOneAndDelete: wrapAsync(
          primary.findOneAndDelete.bind(primary),
          backup.findOneAndDelete.bind(backup)
        ),
        aggregate(pipeline: Record<string, unknown>[] = [], options?: unknown) {
          return {
            async toArray() {
              if (globalForMongo.__studioAtlasHealthy === false) {
                return backup.aggregate(pipeline).toArray();
              }
              try {
                const res = await primary.aggregate(pipeline, options as never).toArray();
                globalForMongo.__studioAtlasHealthy = true;
                return res;
              } catch (err) {
                console.warn(
                  `[StudioSpace Auth] MongoDB Atlas aggregate unreachable (${(err as Error)?.message}), using local fallback store.`
                );
                globalForMongo.__studioAtlasHealthy = false;
                return backup.aggregate(pipeline).toArray();
              }
            },
          };
        },
      };
    },
  } as unknown as Db;
}

export const authDb: Db = createResilientAuthDb();
