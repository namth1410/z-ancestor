import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = global as unknown as { prismaFixed: PrismaClient };

const prismaClientSingleton = () => {
  let url = process.env.DATABASE_URL;

  // Fix for local dev where .env has relative path for CLI but Runtime needs absolute to prisma/
  // OR if no env var is present
  if (!url || url === "file:./dev.db") {
    url = `file:${path.join(process.cwd(), "prisma/dev.db")}`;
  }

  return new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
  });
};

export const db = globalForPrisma.prismaFixed || prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaFixed = db;
