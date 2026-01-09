import { PrismaClient } from "@prisma/client";
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const globalForPrisma = global as unknown as { prismaFixed: PrismaClient };

const url = process.env.DATABASE_URL;

const dbPath =
  typeof url === "string"
    ? url.replace("file:", "")
    : path.join(process.cwd(), "dev.db");

export const db =
  globalForPrisma.prismaFixed ||
  (() => {
    // Use config object with url for adapter to avoid "replace" error
    const adapter = new PrismaBetterSQLite3({ url: `file:${dbPath}` } as {
      url: string;
    });
    return new PrismaClient({ adapter });
  })();

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaFixed = db;
