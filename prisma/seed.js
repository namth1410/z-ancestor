const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(process.cwd(), "dev.db");
const db = new Database(dbPath);

// Generate UUID if not using a library (lite approach)
function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function main() {
  console.log("Seeding database via better-sqlite3...");

  // Clear tables
  db.prepare("DELETE FROM Member").run();

  // Root
  const rootId = uuid();
  db.prepare(
    `
    INSERT INTO Member (id, firstName, lastName, gender, birthDate, occupation, bio, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    rootId,
    "Văn A",
    "Nguyễn",
    "male",
    new Date("1940-01-01").getTime(),
    "Nông dân",
    "Người sáng lập chi họ.",
    Date.now(),
    Date.now()
  );

  // Spouse (Use Date.now() for dates because Prisma stores DateTime as BigInt/Integer in SQLite usually?
  // Wait, Prisma stores DateTime as String or Numeric?
  // Prisma default for SQLite is String (ISO) usually, or Numeric?
  // Let's check Prisma schema mapping or just try String ISO which is safer for SQLite.)

  // Actually, let's use String ISO dates to be safe.
  const now = new Date().toISOString();

  // Re-insert Root with ISO dates
  db.prepare("DELETE FROM Member").run();

  db.prepare(
    `
    INSERT INTO Member (id, firstName, lastName, gender, birthDate, occupation, bio, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    rootId,
    "Văn A",
    "Nguyễn",
    "male",
    new Date("1940-01-01").toISOString(),
    "Nông dân",
    "Người sáng lập chi họ.",
    now,
    now
  );

  // Spouse
  const spouseId = uuid();
  db.prepare(
    `
    INSERT INTO Member (id, firstName, lastName, gender, birthDate, spouseId, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    spouseId,
    "Thị B",
    "Trần",
    "female",
    new Date("1942-05-10").toISOString(),
    rootId,
    now,
    now
  );

  // Update Root with Spouse
  db.prepare("UPDATE Member SET spouseId = ? WHERE id = ?").run(
    spouseId,
    rootId
  );

  // Child 1
  const child1Id = uuid();
  db.prepare(
    `
    INSERT INTO Member (id, firstName, lastName, gender, birthDate, occupation, fatherId, motherId, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    child1Id,
    "Văn C",
    "Nguyễn",
    "male",
    new Date("1965-08-15").toISOString(),
    "Giáo viên",
    rootId,
    spouseId,
    now,
    now
  );

  // Spouse Child 1
  const child1SpouseId = uuid();
  db.prepare(
    `
    INSERT INTO Member (id, firstName, lastName, gender, birthDate, spouseId, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    child1SpouseId,
    "Thị E",
    "Lê",
    "female",
    new Date("1970-02-28").toISOString(),
    child1Id,
    now,
    now
  );

  db.prepare("UPDATE Member SET spouseId = ? WHERE id = ?").run(
    child1SpouseId,
    child1Id
  );

  // Child 2
  const child2Id = uuid();
  db.prepare(
    `
    INSERT INTO Member (id, firstName, lastName, gender, birthDate, fatherId, motherId, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    child2Id,
    "Thị D",
    "Nguyễn",
    "female",
    new Date("1968-11-20").toISOString(),
    rootId,
    spouseId,
    now,
    now
  );

  // Grandchild
  const grandChildId = uuid();
  db.prepare(
    `
    INSERT INTO Member (id, firstName, lastName, gender, birthDate, occupation, fatherId, motherId, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    grandChildId,
    "Văn F",
    "Nguyễn",
    "male",
    new Date("1995-06-01").toISOString(),
    "Kỹ sư phần mềm",
    child1Id,
    child1SpouseId,
    now,
    now
  );

  console.log("Seeding completed successfully.");
}

main();
