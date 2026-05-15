import path from "path";
import { existsSync, copyFileSync } from "fs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// On Vercel serverless the filesystem is read-only except /tmp. The
// seeded SQLite file ships in the repo at prisma/dev.db; on the first
// cold-start of a container we copy it into /tmp so better-sqlite3 can
// open it read/write. Writes don't persist between containers, which
// is fine for a read-only demo showcase.
function resolveDbPath(): string {
  const bundled = path.join(process.cwd(), "prisma", "dev.db");

  if (process.env.VERCEL) {
    const runtimePath = "/tmp/dev.db";
    if (!existsSync(runtimePath) && existsSync(bundled)) {
      copyFileSync(bundled, runtimePath);
    }
    return runtimePath;
  }

  // Local dev / VPS — respect DATABASE_URL if set
  const fromEnv = process.env.DATABASE_URL?.replace(/^file:/, "");
  if (fromEnv) {
    return path.isAbsolute(fromEnv)
      ? fromEnv
      : path.join(process.cwd(), fromEnv);
  }

  return bundled;
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
