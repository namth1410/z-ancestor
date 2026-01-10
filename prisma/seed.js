// Set DATABASE_URL for seed script
const path = require("path");
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${path.join(__dirname, "dev.db")}`;
}

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log("🌱 Seeding real family tree data...");

  // ============= BÊN NỘI =============
  console.log("📝 Creating Trần & Hà members...");

  // Ông bà nội
  const ongNoi = await prisma.member.upsert({
    where: { id: "tran-danh-thai" },
    update: {},
    create: {
      id: "tran-danh-thai",
      firstName: "Danh Thái",
      lastName: "Trần",
      gender: "male",
    },
  });

  const baNoi = await prisma.member.upsert({
    where: { id: "ha-thi-bong" },
    update: {},
    create: {
      id: "ha-thi-bong",
      firstName: "Thị Bổng",
      lastName: "Hà",
      gender: "female",
    },
  });

  // Spouse connection
  await prisma.member.update({
    where: { id: ongNoi.id },
    data: { spouseId: baNoi.id },
  });
  await prisma.member.update({
    where: { id: baNoi.id },
    data: { spouseId: ongNoi.id },
  });

  // === Nhánh 1: Bố mẹ ===
  const bo = await prisma.member.upsert({
    where: { id: "tran-thanh-binh" },
    update: {},
    create: {
      id: "tran-thanh-binh",
      firstName: "Thanh Bình",
      lastName: "Trần",
      gender: "male",
      birthDate: new Date("1972-05-17"),
      fatherId: ongNoi.id,
      motherId: baNoi.id,
    },
  });

  const me = await prisma.member.upsert({
    where: { id: "nguyen-thi-cuc" },
    update: {},
    create: {
      id: "nguyen-thi-cuc",
      firstName: "Thị Cúc",
      lastName: "Nguyễn",
      gender: "female",
      birthDate: new Date("1976-06-26"),
    },
  });

  await prisma.member.update({
    where: { id: bo.id },
    data: { spouseId: me.id },
  });
  await prisma.member.update({
    where: { id: me.id },
    data: { spouseId: bo.id },
  });

  const user = await prisma.member.upsert({
    where: { id: "tran-hai-nam" },
    update: {},
    create: {
      id: "tran-hai-nam",
      firstName: "Hải Nam",
      lastName: "Trần",
      gender: "male",
      birthDate: new Date("2002-10-14"),
      fatherId: bo.id,
      motherId: me.id,
    },
  });

  const emTrai = await prisma.member.upsert({
    where: { id: "tran-cong-dinh" },
    update: {},
    create: {
      id: "tran-cong-dinh",
      firstName: "Công Định",
      lastName: "Trần",
      gender: "male",
      birthDate: new Date("2004-01-03"),
      fatherId: bo.id,
      motherId: me.id,
    },
  });

  // === Nhánh 2: Chú Minh ===
  const chuMinh = await prisma.member.upsert({
    where: { id: "tran-thanh-minh" },
    update: {},
    create: {
      id: "tran-thanh-minh",
      firstName: "Thanh Minh",
      lastName: "Trần",
      gender: "male",
      fatherId: ongNoi.id,
      motherId: baNoi.id,
    },
  });

  const thimHuong = await prisma.member.upsert({
    where: { id: "ta-thi-huong" },
    update: {},
    create: {
      id: "ta-thi-huong",
      firstName: "Thị Hương",
      lastName: "Tạ",
      gender: "female",
    },
  });

  await prisma.member.update({
    where: { id: chuMinh.id },
    data: { spouseId: thimHuong.id },
  });
  await prisma.member.update({
    where: { id: thimHuong.id },
    data: { spouseId: chuMinh.id },
  });

  const danhGiap = await prisma.member.upsert({
    where: { id: "tran-danh-giap" },
    update: {},
    create: {
      id: "tran-danh-giap",
      firstName: "Danh Giáp",
      lastName: "Trần",
      gender: "male",
      birthDate: new Date("1999-12-30"),
      fatherId: chuMinh.id,
      motherId: thimHuong.id,
    },
  });

  const ducNguyen = await prisma.member.upsert({
    where: { id: "tran-duc-nguyen" },
    update: {},
    create: {
      id: "tran-duc-nguyen",
      firstName: "Đức Nguyên",
      lastName: "Trần",
      gender: "male",
      birthDate: new Date("2005-07-03"),
      fatherId: chuMinh.id,
      motherId: thimHuong.id,
    },
  });

  // === Nhánh 3: Cô Hà ===
  const coHa = await prisma.member.upsert({
    where: { id: "tran-thi-ha" },
    update: {},
    create: {
      id: "tran-thi-ha",
      firstName: "Thị Hà",
      lastName: "Trần",
      gender: "female",
      fatherId: ongNoi.id,
      motherId: baNoi.id,
    },
  });

  const chuThang = await prisma.member.upsert({
    where: { id: "thang" },
    update: {},
    create: {
      id: "thang",
      firstName: "Thắng",
      lastName: "",
      gender: "male",
    },
  });

  await prisma.member.update({
    where: { id: coHa.id },
    data: { spouseId: chuThang.id },
  });
  await prisma.member.update({
    where: { id: chuThang.id },
    data: { spouseId: coHa.id },
  });

  const hai = await prisma.member.upsert({
    where: { id: "hai" },
    update: {},
    create: {
      id: "hai",
      firstName: "Hải",
      lastName: "",
      gender: "female",
      fatherId: chuThang.id,
      motherId: coHa.id,
    },
  });

  const lam = await prisma.member.upsert({
    where: { id: "lam" },
    update: {},
    create: {
      id: "lam",
      firstName: "Lãm",
      lastName: "",
      gender: "male",
    },
  });

  await prisma.member.update({
    where: { id: hai.id },
    data: { spouseId: lam.id },
  });
  await prisma.member.update({
    where: { id: lam.id },
    data: { spouseId: hai.id },
  });

  const tieuMy = await prisma.member.upsert({
    where: { id: "tieu-my" },
    update: {},
    create: {
      id: "tieu-my",
      firstName: "Tiểu Mỹ",
      lastName: "",
      gender: "female",
      fatherId: lam.id,
      motherId: hai.id,
    },
  });

  const tieuVy = await prisma.member.upsert({
    where: { id: "tieu-vy" },
    update: {},
    create: {
      id: "tieu-vy",
      firstName: "Tiểu Vy",
      lastName: "",
      gender: "female",
      fatherId: lam.id,
      motherId: hai.id,
    },
  });

  const cuong = await prisma.member.upsert({
    where: { id: "cuong" },
    update: {},
    create: {
      id: "cuong",
      firstName: "Cường",
      lastName: "",
      gender: "male",
      fatherId: chuThang.id,
      motherId: coHa.id,
    },
  });

  const phuong = await prisma.member.upsert({
    where: { id: "phuong" },
    update: {},
    create: {
      id: "phuong",
      firstName: "Phương",
      lastName: "",
      gender: "female",
    },
  });

  await prisma.member.update({
    where: { id: cuong.id },
    data: { spouseId: phuong.id },
  });
  await prisma.member.update({
    where: { id: phuong.id },
    data: { spouseId: cuong.id },
  });

  const conCuongPhuong = await prisma.member.upsert({
    where: { id: "con-cuong-phuong" },
    update: {},
    create: {
      id: "con-cuong-phuong",
      firstName: "X",
      lastName: "",
      gender: "male",
      fatherId: cuong.id,
      motherId: phuong.id,
    },
  });

  console.log("✓ Created Trần & Hà members");

  // ============= BÊN NGOẠI =============
  console.log("📝 Creating Nguyễn & Đào members...");

  const ongNgoai = await prisma.member.upsert({
    where: { id: "nguyen-van-sa" },
    update: {},
    create: {
      id: "nguyen-van-sa",
      firstName: "Văn Sạ",
      lastName: "Nguyễn",
      gender: "male",
    },
  });

  const baNgoai = await prisma.member.upsert({
    where: { id: "dao-thi-co" },
    update: {},
    create: {
      id: "dao-thi-co",
      firstName: "Thị Cò",
      lastName: "Đào",
      gender: "female",
    },
  });

  await prisma.member.update({
    where: { id: ongNgoai.id },
    data: { spouseId: baNgoai.id },
  });
  await prisma.member.update({
    where: { id: baNgoai.id },
    data: { spouseId: ongNgoai.id },
  });

  // Update mẹ user (Nguyễn Thị Cúc)
  await prisma.member.update({
    where: { id: me.id },
    data: { fatherId: ongNgoai.id, motherId: baNgoai.id },
  });

  const cauKien = await prisma.member.upsert({
    where: { id: "nguyen-duc-kien" },
    update: {},
    create: {
      id: "nguyen-duc-kien",
      firstName: "Đức Kiên",
      lastName: "Nguyễn",
      gender: "male",
      fatherId: ongNgoai.id,
      motherId: baNgoai.id,
    },
  });

  const moHanh = await prisma.member.upsert({
    where: { id: "hanh" },
    update: {},
    create: {
      id: "hanh",
      firstName: "Hạnh",
      lastName: "",
      gender: "female",
    },
  });

  await prisma.member.update({
    where: { id: cauKien.id },
    data: { spouseId: moHanh.id },
  });
  await prisma.member.update({
    where: { id: moHanh.id },
    data: { spouseId: cauKien.id },
  });

  const ducCuong = await prisma.member.upsert({
    where: { id: "nguyen-duc-cuong" },
    update: {},
    create: {
      id: "nguyen-duc-cuong",
      firstName: "Đức Cường",
      lastName: "Nguyễn",
      gender: "male",
      birthDate: new Date("2003-06-23"),
      fatherId: cauKien.id,
      motherId: moHanh.id,
    },
  });

  const nganGiang = await prisma.member.upsert({
    where: { id: "nguyen-thi-ngan-giang" },
    update: {},
    create: {
      id: "nguyen-thi-ngan-giang",
      firstName: "Thị Ngân Giang",
      lastName: "Nguyễn",
      gender: "female",
      birthDate: new Date("2005-01-01"),
      fatherId: cauKien.id,
      motherId: moHanh.id,
    },
  });

  const cauQuyet = await prisma.member.upsert({
    where: { id: "nguyen-duc-quyet" },
    update: {},
    create: {
      id: "nguyen-duc-quyet",
      firstName: "Đức Quyết",
      lastName: "Nguyễn",
      gender: "male",
      fatherId: ongNgoai.id,
      motherId: baNgoai.id,
    },
  });

  const moNgoc = await prisma.member.upsert({
    where: { id: "ngoc" },
    update: {},
    create: {
      id: "ngoc",
      firstName: "Ngọc",
      lastName: "",
      gender: "female",
    },
  });

  await prisma.member.update({
    where: { id: cauQuyet.id },
    data: { spouseId: moNgoc.id },
  });
  await prisma.member.update({
    where: { id: moNgoc.id },
    data: { spouseId: cauQuyet.id },
  });

  const haNguyen = await prisma.member.upsert({
    where: { id: "ha-nguyen" },
    update: {},
    create: {
      id: "ha-nguyen",
      firstName: "Hà",
      lastName: "Nguyễn",
      gender: "female",
      fatherId: cauQuyet.id,
      motherId: moNgoc.id,
    },
  });

  const khue = await prisma.member.upsert({
    where: { id: "khue" },
    update: {},
    create: {
      id: "khue",
      firstName: "Khuê",
      lastName: "Nguyễn",
      gender: "female",
      fatherId: cauQuyet.id,
      motherId: moNgoc.id,
    },
  });

  const cauChi = await prisma.member.upsert({
    where: { id: "nguyen-van-chi" },
    update: {},
    create: {
      id: "nguyen-van-chi",
      firstName: "Văn Chí",
      lastName: "Nguyễn",
      gender: "male",
      fatherId: ongNgoai.id,
      motherId: baNgoai.id,
    },
  });

  const moHong = await prisma.member.upsert({
    where: { id: "hong" },
    update: {},
    create: {
      id: "hong",
      firstName: "Hồng",
      lastName: "",
      gender: "female",
    },
  });

  await prisma.member.update({
    where: { id: cauChi.id },
    data: { spouseId: moHong.id },
  });
  await prisma.member.update({
    where: { id: moHong.id },
    data: { spouseId: cauChi.id },
  });

  console.log("✓ Created Nguyễn & Đào members");

  // ============= CREATE 4 LINEAGES =============
  console.log("🏘️  Creating 4 lineages...");

  const lineageTran = await prisma.lineage.upsert({
    where: { code: "tran" },
    update: { name: "Họ Trần (Bên Nội)", rootMemberId: ongNoi.id },
    create: {
      code: "tran",
      name: "Họ Trần (Bên Nội)",
      rootMemberId: ongNoi.id,
    },
  });

  const lineageHa = await prisma.lineage.upsert({
    where: { code: "ha" },
    update: { name: "Họ Hà (Bà Nội)", rootMemberId: baNoi.id },
    create: { code: "ha", name: "Họ Hà (Bà Nội)", rootMemberId: baNoi.id },
  });

  const lineageNguyen = await prisma.lineage.upsert({
    where: { code: "nguyen" },
    update: { name: "Họ Nguyễn (Bên Ngoại)", rootMemberId: ongNgoai.id },
    create: {
      code: "nguyen",
      name: "Họ Nguyễn (Bên Ngoại)",
      rootMemberId: ongNgoai.id,
    },
  });

  const lineageDao = await prisma.lineage.upsert({
    where: { code: "dao" },
    update: { name: "Họ Đào (Bà Ngoại)", rootMemberId: baNgoai.id },
    create: {
      code: "dao",
      name: "Họ Đào (Bà Ngoại)",
      rootMemberId: baNgoai.id,
    },
  });

  console.log("✓ Created 4 lineages");

  // ============= ASSIGN STARTING MEMBERS =============
  // 1. Họ Trần: Ông nội + Con, cháu (theo dòng bố)
  const tranMembers = [
    ongNoi.id,
    bo.id,
    user.id,
    emTrai.id,
    chuMinh.id,
    danhGiap.id,
    ducNguyen.id,
    coHa.id, // Cô Hà là con ông Trần -> thuộc họ Trần
  ];
  await prisma.member.updateMany({
    where: { id: { in: tranMembers } },
    data: { lineageId: lineageTran.id },
  });

  // 2. Họ Hà: Bà Nội
  await prisma.member.update({
    where: { id: baNoi.id },
    data: { lineageId: lineageHa.id },
  });

  // 3. Họ Nguyễn: Ông Ngoại + Con, Cháu (theo dòng mẹ)
  const nguyenMembers = [
    ongNgoai.id,
    cauKien.id,
    ducCuong.id,
    nganGiang.id,
    cauQuyet.id,
    haNguyen.id,
    khue.id,
    cauChi.id,
    // Mẹ (nguyen-thi-cuc) cũng là con ông Nguyễn -> thuộc họ Nguyễn
    // NHƯNG nếu user muốn Mẹ hiện bên cây TRẦN (với tư cách Vợ Bố), thì:
    // - Tree View logic phải support spouse khác lineage.
    // - Tạm thời mình cứ assign Mẹ vào họ Nguyễn (Lineage Gốc).
  ];
  await prisma.member.updateMany({
    where: { id: { in: nguyenMembers } },
    data: { lineageId: lineageNguyen.id },
  });

  await prisma.member.update({
    where: { id: me.id },
    data: { lineageId: lineageNguyen.id },
  });

  // 4. Họ Đào: Bà Ngoại
  await prisma.member.update({
    where: { id: baNgoai.id },
    data: { lineageId: lineageDao.id },
  });

  // Note: Các con dâu, con rể (Thím Hương, Chú Thắng, v.v...) không thuộc 4 dòng họ này.
  // Để null lineageId hoặc tạo lineage khác nếu cần.
  // Hiện tại để null.

  console.log("✅ Seeding completed with 4 lineages logic!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
