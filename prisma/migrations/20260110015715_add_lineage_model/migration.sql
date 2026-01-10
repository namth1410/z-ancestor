-- CreateTable
CREATE TABLE "Lineage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rootMemberId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lineage_rootMemberId_fkey" FOREIGN KEY ("rootMemberId") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthDate" DATETIME,
    "deathDate" DATETIME,
    "birthPlace" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "occupation" TEXT,
    "address" TEXT,
    "lineageId" TEXT,
    "fatherId" TEXT,
    "motherId" TEXT,
    "spouseId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Member_lineageId_fkey" FOREIGN KEY ("lineageId") REFERENCES "Lineage" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Member_fatherId_fkey" FOREIGN KEY ("fatherId") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Member_motherId_fkey" FOREIGN KEY ("motherId") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Member_spouseId_fkey" FOREIGN KEY ("spouseId") REFERENCES "Member" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Member" ("address", "avatar", "bio", "birthDate", "birthPlace", "createdAt", "deathDate", "fatherId", "firstName", "gender", "id", "lastName", "motherId", "occupation", "spouseId", "updatedAt") SELECT "address", "avatar", "bio", "birthDate", "birthPlace", "createdAt", "deathDate", "fatherId", "firstName", "gender", "id", "lastName", "motherId", "occupation", "spouseId", "updatedAt" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Lineage_code_key" ON "Lineage"("code");
