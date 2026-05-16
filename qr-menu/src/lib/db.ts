import path from "path";
import { existsSync, copyFileSync } from "fs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// The seeded SQLite ships under public/dev.db because Vercel guarantees
// public/ files are copied into every serverless function bundle. On a
// Vercel cold-start we copy it into /tmp (the only writable directory
// in the runtime) so better-sqlite3 can open it read/write within that
// container. Writes don't persist across containers, which is fine for
// a read-only demo showcase.
function resolveDbPath(): string {
  const publicSrc = path.join(process.cwd(), "public", "dev.db");
  const legacySrc = path.join(process.cwd(), "prisma", "dev.db");
  const rootSrc = path.join(process.cwd(), "dev.db");
  const source = [publicSrc, legacySrc, rootSrc].find((p) => existsSync(p));

  if (process.env.VERCEL) {
    const runtimePath = "/tmp/dev.db";
    if (!existsSync(runtimePath) && source) {
      copyFileSync(source, runtimePath);
    }
    return runtimePath;
  }

  const fromEnv = process.env.DATABASE_URL?.replace(/^file:/, "");
  if (fromEnv) {
    return path.isAbsolute(fromEnv)
      ? fromEnv
      : path.join(process.cwd(), fromEnv);
  }

  return source ?? rootSrc;
}

function createClient() {
  const dbPath = resolveDbPath();
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
