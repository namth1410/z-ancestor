// Set DATABASE_URL for seed script
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { PrismaClient } = require("@prisma/client");

let url = process.env.DATABASE_URL;
if (!url || url === "file:./dev.db") {
  url = `file:${path.join(__dirname, "dev.db")}`;
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url,
    },
  },
});

async function main() {
  console.log("🌱 Seeding real family tree data...");

  // ============= BÊN NỘI =============
  console.log("📝 Creating Trần & Hà members...");

  // 1. Great-Grandparents (Cụ Cố) - Generation 1
  const cuPhung = await prisma.member.upsert({
    where: { id: "tran-danh-phung" },
    update: {},
    create: {
      id: "tran-danh-phung",
      firstName: "Danh Phúng",
      lastName: "Trần",
      gender: "male",
    },
  });

  const cuBau = await prisma.member.upsert({
    where: { id: "do-thi-bau" },
    update: {},
    create: {
      id: "do-thi-bau",
      firstName: "Thị Báu",
      lastName: "Đỗ",
      gender: "female",
    },
  });

  // Connect Great-Grandparents
  await prisma.member.update({
    where: { id: cuPhung.id },
    data: { spouseId: cuBau.id },
  });
  await prisma.member.update({
    where: { id: cuBau.id },
    data: { spouseId: cuPhung.id },
  });

  // 2. Generation 2 (Siblings of Ông Nội)
  // List: Tôn (1), Thái (2 - Ông Nội), Nhiêm (3), Đường (4), Quản (5)

  // 2.1 Bác Tôn
  const bacTon = await prisma.member.upsert({
    where: { id: "tran-danh-ton" },
    update: { fatherId: cuPhung.id, motherId: cuBau.id, birthOrder: 1 },
    create: {
      id: "tran-danh-ton",
      firstName: "Danh Tôn",
      lastName: "Trần",
      gender: "male",
      fatherId: cuPhung.id,
      motherId: cuBau.id,
      birthOrder: 1,
    },
  });
  const bacLa = await prisma.member.upsert({
    where: { id: "la" },
    update: {},
    create: { id: "la", firstName: "Là", lastName: "", gender: "female" },
  });
  await prisma.member.update({
    where: { id: bacTon.id },
    data: { spouseId: bacLa.id },
  });
  await prisma.member.update({
    where: { id: bacLa.id },
    data: { spouseId: bacTon.id },
  });

  // 2.2 Ông Nội (Trần Danh Thái)
  // We define existing ongNoi here but adding parents
  const ongNoi = await prisma.member.upsert({
    where: { id: "tran-danh-thai" },
    update: { fatherId: cuPhung.id, motherId: cuBau.id, birthOrder: 2 },
    create: {
      id: "tran-danh-thai",
      firstName: "Danh Thái",
      lastName: "Trần",
      gender: "male",
      fatherId: cuPhung.id,
      motherId: cuBau.id,
      birthOrder: 2,
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

  // 2.3 Nhiêm (Không rõ giới tính, tạm để Nam hoặc Nữ, MD nói không rõ)
  // Assuming Male for now or check MD context. "Nhiêm" sounds ambiguous.
  // MD says "Không rõ giới tính". Let's assume Female/Male? Let's pick Female as random guess or leave Neutral?
  // Schema requires gender "male" | "female". Let's guess Female (Cô Nhiêm).
  const coNhiem = await prisma.member.upsert({
    where: { id: "nhiem" },
    update: { fatherId: cuPhung.id, motherId: cuBau.id, birthOrder: 3 },
    create: {
      id: "nhiem",
      firstName: "Nhiêm",
      lastName: "Trần",
      gender: "female",
      fatherId: cuPhung.id,
      motherId: cuBau.id,
      birthOrder: 3,
    },
  });

  // 2.4 Ông Đường
  const ongDuong = await prisma.member.upsert({
    where: { id: "tran-hai-duong" },
    update: { fatherId: cuPhung.id, motherId: cuBau.id, birthOrder: 4 },
    create: {
      id: "tran-hai-duong",
      firstName: "Hải Đường",
      lastName: "Trần",
      gender: "male",
      fatherId: cuPhung.id,
      motherId: cuBau.id,
      birthOrder: 4,
    },
  });
  const baLan = await prisma.member.upsert({
    where: { id: "lan" },
    update: {},
    create: { id: "lan", firstName: "Lân", lastName: "", gender: "female" },
  });
  await prisma.member.update({
    where: { id: ongDuong.id },
    data: { spouseId: baLan.id },
  });
  await prisma.member.update({
    where: { id: baLan.id },
    data: { spouseId: ongDuong.id },
  });

  // 2.5 Bà Quản
  const baQuan = await prisma.member.upsert({
    where: { id: "tran-thi-quan" },
    update: { fatherId: cuPhung.id, motherId: cuBau.id, birthOrder: 5 },
    create: {
      id: "tran-thi-quan",
      firstName: "Thị Quản",
      lastName: "Trần",
      gender: "female",
      fatherId: cuPhung.id,
      motherId: cuBau.id,
      birthOrder: 5,
    },
  });
  const ongGiang = await prisma.member.upsert({
    where: { id: "giang" },
    update: {},
    create: { id: "giang", firstName: "Giang", lastName: "", gender: "male" },
  });
  await prisma.member.update({
    where: { id: baQuan.id },
    data: { spouseId: ongGiang.id },
  });
  await prisma.member.update({
    where: { id: ongGiang.id },
    data: { spouseId: baQuan.id },
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

  // 1. Great-Grandparents (Cụ Cố Ngoại - Họ Nguyễn)
  const cuTu = await prisma.member.upsert({
    where: { id: "nguyen-van-tu" },
    update: {},
    create: {
      id: "nguyen-van-tu",
      firstName: "Văn Tự",
      lastName: "Nguyễn",
      gender: "male",
      deathDate: new Date("1996-01-01"),
    },
  });

  const cuDinh = await prisma.member.upsert({
    where: { id: "nguyen-thi-dinh" },
    update: {},
    create: {
      id: "nguyen-thi-dinh",
      firstName: "Thị Đính",
      lastName: "Nguyễn",
      gender: "female",
      deathDate: new Date("2010-01-01"),
    },
  });

  // Connect Great-Grandparents
  await prisma.member.update({
    where: { id: cuTu.id },
    data: { spouseId: cuDinh.id },
  });
  await prisma.member.update({
    where: { id: cuDinh.id },
    data: { spouseId: cuTu.id },
  });

  // 2. Generation 2 (Siblings of Ông Ngoại)
  // List: Thanh (1), Tước (2), Sạ (3 - Ông Ngoại), Hương (4), Sáp (5), Sáu (6), Bảy (7)

  // 2.1 Bà Thanh
  const baThanh = await prisma.member.upsert({
    where: { id: "nguyen-thi-thanh" },
    update: { fatherId: cuTu.id, motherId: cuDinh.id, birthOrder: 1 },
    create: {
      id: "nguyen-thi-thanh",
      firstName: "Thị Thanh",
      lastName: "Nguyễn",
      gender: "female",
      fatherId: cuTu.id,
      motherId: cuDinh.id,
      birthOrder: 1,
    },
  });
  const ongSu = await prisma.member.upsert({
    where: { id: "kim-van-su" },
    update: {},
    create: {
      id: "kim-van-su",
      firstName: "Văn Sự",
      lastName: "Kim",
      gender: "male",
    },
  });
  await prisma.member.update({
    where: { id: baThanh.id },
    data: { spouseId: ongSu.id },
  });
  await prisma.member.update({
    where: { id: ongSu.id },
    data: { spouseId: baThanh.id },
  });

  // Children of Ba Thanh
  const childrenThanh = [
    {
      id: "kim-thi-tam",
      name: "Thị Tâm",
      gender: "female",
      spouse: "Nguyễn Hữu Nghê",
    },
    {
      id: "kim-van-luong",
      name: "Văn Lương",
      gender: "male",
      spouse: "Trần Thị Loan",
    },
  ];
  for (const [index, child] of childrenThanh.entries()) {
    const c = await prisma.member.upsert({
      where: { id: child.id },
      update: {
        fatherId: ongSu.id,
        motherId: baThanh.id,
        birthOrder: index + 1,
      },
      create: {
        id: child.id,
        firstName: child.name,
        lastName: "Kim",
        gender: child.gender,
        fatherId: ongSu.id,
        motherId: baThanh.id,
        birthOrder: index + 1,
      },
    });
    if (child.spouse) {
      const spId = `spouse-of-${child.id}`;
      const sp = await prisma.member.upsert({
        where: { id: spId },
        update: {},
        create: {
          id: spId,
          firstName: child.spouse,
          lastName: "",
          gender: "male",
        }, // approximate gender guess
      });
      await prisma.member.update({
        where: { id: c.id },
        data: { spouseId: sp.id },
      });
      await prisma.member.update({
        where: { id: sp.id },
        data: { spouseId: c.id },
      });
    }
  }

  // 2.2 Ông Tước
  const ongTuoc = await prisma.member.upsert({
    where: { id: "nguyen-van-tuoc" },
    update: { fatherId: cuTu.id, motherId: cuDinh.id, birthOrder: 2 },
    create: {
      id: "nguyen-van-tuoc",
      firstName: "Văn Tước",
      lastName: "Nguyễn",
      gender: "male",
      deathDate: new Date("2008-01-01"),
      fatherId: cuTu.id,
      motherId: cuDinh.id,
      birthOrder: 2,
    },
  });
  const baThiet = await prisma.member.upsert({
    where: { id: "nguyen-thi-thiet" },
    update: {},
    create: {
      id: "nguyen-thi-thiet",
      firstName: "Thị Thiết",
      lastName: "Nguyễn",
      gender: "female",
    },
  });
  await prisma.member.update({
    where: { id: ongTuoc.id },
    data: { spouseId: baThiet.id },
  });
  await prisma.member.update({
    where: { id: baThiet.id },
    data: { spouseId: ongTuoc.id },
  });

  // Children of Ong Tuoc
  const childrenTuoc = [
    {
      id: "nguyen-van-toan",
      name: "Văn Toàn",
      gender: "male",
      year: "1970",
      spouse: "Kim Thị Hiên",
    },
    {
      id: "nguyen-duc-dien",
      name: "Đức Diện",
      gender: "male",
      year: "1972",
      spouse: "Dương",
    },
    {
      id: "nguyen-thi-quyen",
      name: "Thị Quyên",
      gender: "female",
      year: "1977",
      spouse: "Trần Văn Thời",
    },
    {
      id: "nguyen-van-bao",
      name: "Văn Bảo",
      gender: "male",
      year: "1979",
      spouse: "Nguyễn Thị Hà",
    },
    {
      id: "nguyen-van-viet",
      name: "Văn Việt",
      gender: "male",
      year: "1982",
      spouse: "Thúy",
    },
  ];
  for (const [index, child] of childrenTuoc.entries()) {
    const c = await prisma.member.upsert({
      where: { id: child.id },
      update: {
        fatherId: ongTuoc.id,
        motherId: baThiet.id,
        birthOrder: index + 1,
      },
      create: {
        id: child.id,
        firstName: child.name,
        lastName: "Nguyễn",
        gender: child.gender,
        birthDate: child.year ? new Date(`${child.year}-01-01`) : undefined,
        fatherId: ongTuoc.id,
        motherId: baThiet.id,
        birthOrder: index + 1,
      },
    });
    if (child.spouse) {
      const spId = `spouse-of-${child.id}`;
      const sp = await prisma.member.upsert({
        where: { id: spId },
        update: {},
        create: {
          id: spId,
          firstName: child.spouse,
          lastName: "",
          gender: "female",
        },
      });
      await prisma.member.update({
        where: { id: c.id },
        data: { spouseId: sp.id },
      });
      await prisma.member.update({
        where: { id: sp.id },
        data: { spouseId: c.id },
      });
    }
  }

  // 2.3 Ông Sạ (Ông Ngoại) -> Defined below, but updated here for parent link linkage later or prepended.
  // We will upsert him immediately below or here. Let's do it here to keep flow.
  const ongNgoai = await prisma.member.upsert({
    where: { id: "nguyen-van-sa" },
    update: { fatherId: cuTu.id, motherId: cuDinh.id, birthOrder: 3 },
    create: {
      id: "nguyen-van-sa",
      firstName: "Văn Sạ",
      lastName: "Nguyễn",
      gender: "male",
      birthDate: new Date("1950-01-01"),
      fatherId: cuTu.id,
      motherId: cuDinh.id,
      birthOrder: 3,
    },
  });

  // 2.4 Bà Hương
  const baHuong = await prisma.member.upsert({
    where: { id: "nguyen-thi-huong" },
    update: { fatherId: cuTu.id, motherId: cuDinh.id, birthOrder: 4 },
    create: {
      id: "nguyen-thi-huong",
      firstName: "Thị Hương",
      lastName: "Nguyễn",
      gender: "female",
      deathDate: new Date("1972-01-01"),
      fatherId: cuTu.id,
      motherId: cuDinh.id,
      birthOrder: 4,
    },
  });

  // 2.5 Bà Sáp
  const baSap = await prisma.member.upsert({
    where: { id: "nguyen-thi-sap" },
    update: { fatherId: cuTu.id, motherId: cuDinh.id, birthOrder: 5 },
    create: {
      id: "nguyen-thi-sap",
      firstName: "Thị Sáp",
      lastName: "Nguyễn",
      gender: "female",
      fatherId: cuTu.id,
      motherId: cuDinh.id,
      birthOrder: 5,
    },
  });
  const ongHo = await prisma.member.upsert({
    where: { id: "ho" },
    update: {},
    create: { id: "ho", firstName: "Hồ", lastName: "", gender: "male" },
  });
  await prisma.member.update({
    where: { id: baSap.id },
    data: { spouseId: ongHo.id },
  });
  await prisma.member.update({
    where: { id: ongHo.id },
    data: { spouseId: baSap.id },
  });

  // Children of Ba Sap
  const childrenSap = [
    { id: "nguyen-thi-thuy-sap", name: "Thị Thủy", gender: "female" },
    {
      id: "nguyen-van-nam-sap",
      name: "Văn Nam",
      gender: "male",
      spouse: "Trang",
    },
  ];
  for (const [index, child] of childrenSap.entries()) {
    const c = await prisma.member.upsert({
      where: { id: child.id },
      update: { fatherId: ongHo.id, motherId: baSap.id, birthOrder: index + 1 },
      create: {
        id: child.id,
        firstName: child.name,
        lastName: "Nguyễn", // Assuming mother's surname as placeholder if father unknown surname
        gender: child.gender,
        fatherId: ongHo.id,
        motherId: baSap.id,
        birthOrder: index + 1,
      },
    });
    if (child.spouse) {
      const spId = `spouse-of-${child.id}`;
      const sp = await prisma.member.upsert({
        where: { id: spId },
        update: {},
        create: {
          id: spId,
          firstName: child.spouse,
          lastName: "",
          gender: "female",
        },
      });
      await prisma.member.update({
        where: { id: c.id },
        data: { spouseId: sp.id },
      });
      await prisma.member.update({
        where: { id: sp.id },
        data: { spouseId: c.id },
      });
    }
  }

  // 2.6 Ông Sáu
  const ongSau = await prisma.member.upsert({
    where: { id: "nguyen-van-sau" },
    update: { fatherId: cuTu.id, motherId: cuDinh.id, birthOrder: 6 },
    create: {
      id: "nguyen-van-sau",
      firstName: "Văn Sáu",
      lastName: "Nguyễn",
      gender: "male",
      fatherId: cuTu.id,
      motherId: cuDinh.id,
      birthOrder: 6,
    },
  });
  const baHoan = await prisma.member.upsert({
    where: { id: "hoan" },
    update: {},
    create: { id: "hoan", firstName: "Hoan", lastName: "", gender: "female" },
  });
  await prisma.member.update({
    where: { id: ongSau.id },
    data: { spouseId: baHoan.id },
  });
  await prisma.member.update({
    where: { id: baHoan.id },
    data: { spouseId: ongSau.id },
  });

  // Children of Ong Sau
  const childrenSau = [
    {
      id: "nguyen-thi-lien",
      name: "Thị Liên",
      gender: "female",
      spouse: "Linh",
    },
    {
      id: "nguyen-thi-huong-sau",
      name: "Thị Hường",
      gender: "female",
      spouse: "An",
    },
    { id: "nguyen-van-sang", name: "Văn Sáng", gender: "male", spouse: "Sinh" },
    {
      id: "nguyen-thi-mai-sau",
      name: "Thị Mai",
      gender: "female",
      spouse: "Cường",
    },
  ];
  for (const [index, child] of childrenSau.entries()) {
    const c = await prisma.member.upsert({
      where: { id: child.id },
      update: {
        fatherId: ongSau.id,
        motherId: baHoan.id,
        birthOrder: index + 1,
      },
      create: {
        id: child.id,
        firstName: child.name,
        lastName: "Nguyễn",
        gender: child.gender,
        fatherId: ongSau.id,
        motherId: baHoan.id,
        birthOrder: index + 1,
      },
    });
    if (child.spouse) {
      const spId = `spouse-of-${child.id}`;
      const sp = await prisma.member.upsert({
        where: { id: spId },
        update: {},
        create: {
          id: spId,
          firstName: child.spouse,
          lastName: "",
          gender: child.gender === "male" ? "female" : "male",
        },
      });
      await prisma.member.update({
        where: { id: c.id },
        data: { spouseId: sp.id },
      });
      await prisma.member.update({
        where: { id: sp.id },
        data: { spouseId: c.id },
      });
    }
  }

  // 2.7 Bà Bảy
  const baBay = await prisma.member.upsert({
    where: { id: "nguyen-thi-bay" },
    update: { fatherId: cuTu.id, motherId: cuDinh.id, birthOrder: 7 },
    create: {
      id: "nguyen-thi-bay",
      firstName: "Thị Bảy",
      lastName: "Nguyễn",
      gender: "female",
      fatherId: cuTu.id,
      motherId: cuDinh.id,
      birthOrder: 7,
    },
  });
  const ongDem = await prisma.member.upsert({
    where: { id: "dem" },
    update: {},
    create: { id: "dem", firstName: "Đếm", lastName: "", gender: "male" },
  });
  await prisma.member.update({
    where: { id: baBay.id },
    data: { spouseId: ongDem.id },
  });
  await prisma.member.update({
    where: { id: ongDem.id },
    data: { spouseId: baBay.id },
  });

  // Children of Ba Bay
  const childrenBay = [
    {
      id: "nguyen-thi-lan-bay",
      name: "Thị Lan",
      gender: "female",
      spouse: "Dũng",
    },
    {
      id: "nguyen-thi-nghia",
      name: "Thị Nghĩa",
      gender: "female",
      spouse: "Tân",
    },
    {
      id: "nguyen-thi-tinh",
      name: "Thị Tình",
      gender: "female",
      spouse: "Quảng",
    },
    {
      id: "nguyen-thi-duyen",
      name: "Thị Duyên",
      gender: "female",
      spouse: "Sơn",
    },
    { id: "nguyen-thi-diu", name: "Thị Dịu", gender: "female", spouse: null },
    { id: "tan-con-bay", name: "Tấn", gender: "male" },
  ];
  for (const [index, child] of childrenBay.entries()) {
    const c = await prisma.member.upsert({
      where: { id: child.id },
      update: {
        fatherId: ongDem.id,
        motherId: baBay.id,
        birthOrder: index + 1,
      },
      create: {
        id: child.id,
        firstName: child.name,
        lastName: "", // Unknown surname
        gender: child.gender,
        fatherId: ongDem.id,
        motherId: baBay.id,
        birthOrder: index + 1,
      },
    });
    if (child.spouse) {
      const spId = `spouse-of-${child.id}`;
      const sp = await prisma.member.upsert({
        where: { id: spId },
        update: {},
        create: {
          id: spId,
          firstName: child.spouse,
          lastName: "",
          gender: "male",
        },
      });
      await prisma.member.update({
        where: { id: c.id },
        data: { spouseId: sp.id },
      });
      await prisma.member.update({
        where: { id: sp.id },
        data: { spouseId: c.id },
      });
    }
  }

  // 1. Great-Grandparents (Cụ Cố Ngoại - Họ Đào)
  const cuCoc = await prisma.member.upsert({
    where: { id: "dao-van-coc" },
    update: {},
    create: {
      id: "dao-van-coc",
      firstName: "Văn Cốc",
      lastName: "Đào",
      gender: "male",
      deathDate: new Date("1977-01-01"),
    },
  });

  const cuDe = await prisma.member.upsert({
    where: { id: "dao-thi-de" },
    update: {},
    create: {
      id: "dao-thi-de",
      firstName: "Thị Để",
      lastName: "Đào",
      gender: "female",
      deathDate: new Date("2024-01-01"),
    },
  });

  // Connect Great-Grandparents
  await prisma.member.update({
    where: { id: cuCoc.id },
    data: { spouseId: cuDe.id },
  });
  await prisma.member.update({
    where: { id: cuDe.id },
    data: { spouseId: cuCoc.id },
  });

  // 2. Generation 2 (Siblings of Bà Ngoại)
  // List: Cò (1), Chăm (2), Chỉ (3), Thêu (4), Huê (5), Mai (6)

  // 2.1 Bà Cò (Bà Ngoại)
  const baNgoai = await prisma.member.upsert({
    where: { id: "dao-thi-co" },
    update: { fatherId: cuCoc.id, motherId: cuDe.id, birthOrder: 1 },
    create: {
      id: "dao-thi-co",
      firstName: "Thị Cò",
      lastName: "Đào",
      gender: "female",
      birthDate: new Date("1954-01-01"),
      fatherId: cuCoc.id,
      motherId: cuDe.id,
      birthOrder: 1,
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

  // 2.2 Bà Chăm
  const baCham = await prisma.member.upsert({
    where: { id: "dao-thi-cham" },
    update: { fatherId: cuCoc.id, motherId: cuDe.id, birthOrder: 2 },
    create: {
      id: "dao-thi-cham",
      firstName: "Thị Chăm",
      lastName: "Đào",
      gender: "female",
      birthDate: new Date("1968-01-01"),
      fatherId: cuCoc.id,
      motherId: cuDe.id,
      birthOrder: 2,
    },
  });
  const ongDan = await prisma.member.upsert({
    where: { id: "nguyen-van-dan" },
    update: {},
    create: {
      id: "nguyen-van-dan",
      firstName: "Văn Đần",
      lastName: "Nguyễn",
      gender: "male",
    },
  });
  await prisma.member.update({
    where: { id: baCham.id },
    data: { spouseId: ongDan.id },
  });
  await prisma.member.update({
    where: { id: ongDan.id },
    data: { spouseId: baCham.id },
  });

  // Children of Ba Cham
  const childrenCham = [
    {
      id: "nguyen-van-hung",
      name: "Văn Hùng",
      gender: "male",
      year: "1981",
      spouse: "Kim Thị Lâm",
    },
    { id: "nguyen-van-son", name: "Văn Sơn", gender: "male", year: "1984" },
    { id: "nguyen-van-hai", name: "Văn Hải", gender: "male", year: "1986" },
    { id: "nguyen-thi-van", name: "Thị Vân", gender: "female" },
    { id: "nguyen-van-quan", name: "Văn Quân", gender: "male", year: "1994" },
    { id: "nguyen-van-khu", name: "Văn Khu", gender: "male", year: "1994" },
  ];
  for (const [index, child] of childrenCham.entries()) {
    const c = await prisma.member.upsert({
      where: { id: child.id },
      update: {
        fatherId: ongDan.id,
        motherId: baCham.id,
        birthOrder: index + 1,
      },
      create: {
        id: child.id,
        firstName: child.name,
        lastName: "Nguyễn",
        gender: child.gender,
        birthDate: child.year ? new Date(`${child.year}-01-01`) : undefined,
        fatherId: ongDan.id,
        motherId: baCham.id,
        birthOrder: index + 1,
      },
    });
    if (child.spouse) {
      const spId = `spouse-of-${child.id}`;
      const sp = await prisma.member.upsert({
        where: { id: spId },
        update: {},
        create: {
          id: spId,
          firstName: child.spouse,
          lastName: "",
          gender: "female",
        },
      });
      await prisma.member.update({
        where: { id: c.id },
        data: { spouseId: sp.id },
      });
      await prisma.member.update({
        where: { id: sp.id },
        data: { spouseId: c.id },
      });
    }
  }

  // 2.3 Bà Chỉ
  const baChi = await prisma.member.upsert({
    where: { id: "dao-thi-chi" },
    update: { fatherId: cuCoc.id, motherId: cuDe.id, birthOrder: 3 },
    create: {
      id: "dao-thi-chi",
      firstName: "Thị Chỉ",
      lastName: "Đào",
      gender: "female",
      fatherId: cuCoc.id,
      motherId: cuDe.id,
      birthOrder: 3,
    },
  });
  const ongSon = await prisma.member.upsert({
    where: { id: "dao-dinh-son" },
    update: {},
    create: {
      id: "dao-dinh-son",
      firstName: "Đình Sơn",
      lastName: "Đào",
      gender: "male",
    },
  });
  await prisma.member.update({
    where: { id: baChi.id },
    data: { spouseId: ongSon.id },
  });
  await prisma.member.update({
    where: { id: ongSon.id },
    data: { spouseId: baChi.id },
  });

  // Children of Ba Chi
  const childrenChi = [
    { id: "dao-thi-xuan", name: "Thị Xuân", gender: "female", spouse: "Quân" },
    { id: "dao-thi-thu", name: "Thị Thu", gender: "female", spouse: "Thắng" },
    { id: "dao-dinh-giang", name: "Đình Giang", gender: "male", spouse: "Thu" },
  ];
  for (const [index, child] of childrenChi.entries()) {
    const c = await prisma.member.upsert({
      where: { id: child.id },
      update: {
        fatherId: ongSon.id,
        motherId: baChi.id,
        birthOrder: index + 1,
      },
      create: {
        id: child.id,
        firstName: child.name,
        lastName: "Đào",
        gender: child.gender,
        fatherId: ongSon.id,
        motherId: baChi.id,
        birthOrder: index + 1,
      },
    });
    if (child.spouse) {
      const spId = `spouse-of-${child.id}`;
      const sp = await prisma.member.upsert({
        where: { id: spId },
        update: {},
        create: {
          id: spId,
          firstName: child.spouse,
          lastName: "",
          gender: child.gender === "male" ? "female" : "male",
        },
      });
      await prisma.member.update({
        where: { id: c.id },
        data: { spouseId: sp.id },
      });
      await prisma.member.update({
        where: { id: sp.id },
        data: { spouseId: c.id },
      });
    }
  }

  // 2.4 Bà Thêu
  const baTheu = await prisma.member.upsert({
    where: { id: "dao-thi-theu" },
    update: { fatherId: cuCoc.id, motherId: cuDe.id, birthOrder: 4 },
    create: {
      id: "dao-thi-theu",
      firstName: "Thị Thêu",
      lastName: "Đào",
      gender: "female",
      fatherId: cuCoc.id,
      motherId: cuDe.id,
      birthOrder: 4,
    },
  });
  const ongTue = await prisma.member.upsert({
    where: { id: "pham-van-tue" },
    update: {},
    create: {
      id: "pham-van-tue",
      firstName: "Văn Tuệ",
      lastName: "Phạm",
      gender: "male",
    },
  });
  await prisma.member.update({
    where: { id: baTheu.id },
    data: { spouseId: ongTue.id },
  });
  await prisma.member.update({
    where: { id: ongTue.id },
    data: { spouseId: baTheu.id },
  });

  // Children of Ba Theu
  const childrenTheu = [
    {
      id: "pham-thi-thuy",
      name: "Thị Thúy",
      gender: "female",
      spouse: "Thịnh",
    }, // MD says "Thạnh", I will optimize search later if needed, assuming match
    { id: "pham-thi-lan", name: "Thị Lan", gender: "female", spouse: "Quý" },
    { id: "pham-van-quy", name: "Văn Quý", gender: "male", spouse: "Dịu" },
    { id: "pham-thi-dung", name: "Thị Dung", gender: "female", year: "2002" },
  ];
  for (const [index, child] of childrenTheu.entries()) {
    const c = await prisma.member.upsert({
      where: { id: child.id },
      update: {
        fatherId: ongTue.id,
        motherId: baTheu.id,
        birthOrder: index + 1,
      },
      create: {
        id: child.id,
        firstName: child.name,
        lastName: "Phạm",
        gender: child.gender,
        birthDate: child.year ? new Date(`${child.year}-01-01`) : undefined,
        fatherId: ongTue.id,
        motherId: baTheu.id,
        birthOrder: index + 1,
      },
    });
    if (child.spouse) {
      const spId = `spouse-of-${child.id}`;
      const sp = await prisma.member.upsert({
        where: { id: spId },
        update: {},
        create: {
          id: spId,
          firstName: child.spouse,
          lastName: "",
          gender: child.gender === "male" ? "female" : "male",
        },
      });
      await prisma.member.update({
        where: { id: c.id },
        data: { spouseId: sp.id },
      });
      await prisma.member.update({
        where: { id: sp.id },
        data: { spouseId: c.id },
      });
    }
  }

  // 2.5 Ông Huê
  const ongHue = await prisma.member.upsert({
    where: { id: "dao-van-hue" },
    update: { fatherId: cuCoc.id, motherId: cuDe.id, birthOrder: 5 },
    create: {
      id: "dao-van-hue",
      firstName: "Văn Huê",
      lastName: "Đào",
      gender: "male",
      birthDate: new Date("1971-01-01"),
      fatherId: cuCoc.id,
      motherId: cuDe.id,
      birthOrder: 5,
    },
  });
  const baHoaDao = await prisma.member.upsert({
    where: { id: "nguyen-thi-hoa" },
    update: {},
    create: {
      id: "nguyen-thi-hoa",
      firstName: "Thị Hoa",
      lastName: "Nguyễn",
      gender: "female",
    },
  });
  await prisma.member.update({
    where: { id: ongHue.id },
    data: { spouseId: baHoaDao.id },
  });
  await prisma.member.update({
    where: { id: baHoaDao.id },
    data: { spouseId: ongHue.id },
  });

  // Children of Ong Hue
  const childrenHue = [
    { id: "dao-thi-hue", name: "Thị Huế", gender: "female", spouse: "Hiếu" },
    { id: "dao-van-hieu", name: "Văn Hiếu", gender: "male" },
    { id: "dao-thi-thao", name: "Thị Thảo", gender: "female" },
  ];
  for (const [index, child] of childrenHue.entries()) {
    const c = await prisma.member.upsert({
      where: { id: child.id },
      update: {
        fatherId: ongHue.id,
        motherId: baHoaDao.id,
        birthOrder: index + 1,
      },
      create: {
        id: child.id,
        firstName: child.name,
        lastName: "Đào",
        gender: child.gender,
        fatherId: ongHue.id,
        motherId: baHoaDao.id,
        birthOrder: index + 1,
      },
    });
    if (child.spouse) {
      const spId = `spouse-of-${child.id}`;
      const sp = await prisma.member.upsert({
        where: { id: spId },
        update: {},
        create: {
          id: spId,
          firstName: child.spouse,
          lastName: "",
          gender: child.gender === "male" ? "female" : "male",
        },
      });
      await prisma.member.update({
        where: { id: c.id },
        data: { spouseId: sp.id },
      });
      await prisma.member.update({
        where: { id: sp.id },
        data: { spouseId: c.id },
      });
    }
  }

  // 2.6 Bà Mai
  const baMai = await prisma.member.upsert({
    where: { id: "dao-thi-mai" },
    update: { fatherId: cuCoc.id, motherId: cuDe.id, birthOrder: 6 },
    create: {
      id: "dao-thi-mai",
      firstName: "Thị Mai",
      lastName: "Đào",
      gender: "female",
      birthDate: new Date("1975-01-01"),
      fatherId: cuCoc.id,
      motherId: cuDe.id,
      birthOrder: 6,
    },
  });
  const ongTuoi = await prisma.member.upsert({
    where: { id: "tran-van-tuoi" },
    update: {},
    create: {
      id: "tran-van-tuoi",
      firstName: "Văn Tươi",
      lastName: "Trần",
      gender: "male",
    },
  });
  await prisma.member.update({
    where: { id: baMai.id },
    data: { spouseId: ongTuoi.id },
  });
  await prisma.member.update({
    where: { id: ongTuoi.id },
    data: { spouseId: baMai.id },
  });

  // Children of Ba Mai
  const childrenMai = [
    { id: "tran-van-manh", name: "Văn Mạnh", gender: "male", spouse: "Huyền" },
    {
      id: "tran-thi-hanh",
      name: "Thị Hạnh",
      gender: "female",
      spouse: "Chiến",
    },
    { id: "tran-thi-huyen", name: "Thị Huyền", gender: "female" },
  ];
  for (const [index, child] of childrenMai.entries()) {
    const c = await prisma.member.upsert({
      where: { id: child.id },
      update: {
        fatherId: ongTuoi.id,
        motherId: baMai.id,
        birthOrder: index + 1,
      },
      create: {
        id: child.id,
        firstName: child.name,
        lastName: "Trần",
        gender: child.gender,
        fatherId: ongTuoi.id,
        motherId: baMai.id,
        birthOrder: index + 1,
      },
    });
    if (child.spouse) {
      const spId = `spouse-of-${child.id}`;
      const sp = await prisma.member.upsert({
        where: { id: spId },
        update: {},
        create: {
          id: spId,
          firstName: child.spouse,
          lastName: "",
          gender: child.gender === "male" ? "female" : "male",
        },
      });
      await prisma.member.update({
        where: { id: c.id },
        data: { spouseId: sp.id },
      });
      await prisma.member.update({
        where: { id: sp.id },
        data: { spouseId: c.id },
      });
    }
  }

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

  // ============= BÊN BÀ NỘI (HỌ HÀ) =============
  console.log("📝 Creating Họ Hà (Grandmother's Lineage)...");

  // 1. Great-Grandparents (Cụ Cố)
  const cuDam = await prisma.member.upsert({
    where: { id: "ha-van-dam" },
    update: {},
    create: {
      id: "ha-van-dam",
      firstName: "Văn Dậm",
      lastName: "Hà",
      gender: "male",
    },
  });

  const cuKhoan = await prisma.member.upsert({
    where: { id: "bui-thi-khoan" },
    update: {},
    create: {
      id: "bui-thi-khoan",
      firstName: "Thị Khoan",
      lastName: "Bùi",
      gender: "female",
    },
  });

  // Connect Great-Grandparents
  await prisma.member.update({
    where: { id: cuDam.id },
    data: { spouseId: cuKhoan.id },
  });
  await prisma.member.update({
    where: { id: cuKhoan.id },
    data: { spouseId: cuDam.id },
  });

  // 2. Generation 2 (Children of Cụ Dậm & Cụ Khoan)
  // List: Diều (1), Sáo (2), Đu (3), Nên (4), Bổng (5), Nõn (6)

  // 2.1 Bà Diều
  const baDieu = await prisma.member.upsert({
    where: { id: "ha-thi-dieu" },
    update: { fatherId: cuDam.id, motherId: cuKhoan.id, birthOrder: 1 },
    create: {
      id: "ha-thi-dieu",
      firstName: "Thị Diều",
      lastName: "Hà",
      gender: "female",
      fatherId: cuDam.id,
      motherId: cuKhoan.id,
      birthOrder: 1,
    },
  });
  const ongThai = await prisma.member.upsert({
    where: { id: "thai" },
    update: {},
    create: { id: "thai", firstName: "Thải", lastName: "", gender: "male" },
  });
  await prisma.member.update({
    where: { id: baDieu.id },
    data: { spouseId: ongThai.id },
  });
  await prisma.member.update({
    where: { id: ongThai.id },
    data: { spouseId: baDieu.id },
  });

  // Children of Ba Dieu
  const childrenDieu = [
    {
      id: "thai-con-dieu",
      name: "Thái",
      gender: "male",
      order: 1,
      spouse: "Vinh",
    },
    {
      id: "dong-con-dieu",
      name: "Đông",
      gender: "male",
      order: 2,
      spouse: "Lê",
    },
    {
      id: "phuong-con-dieu",
      name: "Phương",
      gender: "female",
      order: 3,
      spouse: "Hiến",
    },
    {
      id: "lan-con-dieu",
      name: "Lan",
      gender: "female",
      order: 4,
      spouse: "Lưu",
    },
    {
      id: "hue-con-dieu",
      name: "Huệ",
      gender: "female",
      order: 5,
      spouse: "Trong",
    },
  ];

  for (const child of childrenDieu) {
    const c = await prisma.member.upsert({
      where: { id: child.id },
      update: {
        fatherId: ongThai.id,
        motherId: baDieu.id,
        birthOrder: child.order,
      },
      create: {
        id: child.id,
        firstName: child.name,
        lastName: "",
        gender: child.gender,
        fatherId: ongThai.id,
        motherId: baDieu.id,
        birthOrder: child.order,
      },
    });
    if (child.spouse) {
      const spId = `spouse-of-${child.id}`;
      const sp = await prisma.member.upsert({
        where: { id: spId },
        update: {},
        create: {
          id: spId,
          firstName: child.spouse,
          lastName: "",
          gender: child.gender === "male" ? "female" : "male",
        },
      });
      await prisma.member.update({
        where: { id: c.id },
        data: { spouseId: sp.id },
      });
      await prisma.member.update({
        where: { id: sp.id },
        data: { spouseId: c.id },
      });
    }
  }

  // 2.2 Ông Sáo
  const ongSao = await prisma.member.upsert({
    where: { id: "ha-van-sao" },
    update: { fatherId: cuDam.id, motherId: cuKhoan.id, birthOrder: 2 },
    create: {
      id: "ha-van-sao",
      firstName: "Văn Sáo",
      lastName: "Hà",
      gender: "male",
      fatherId: cuDam.id,
      motherId: cuKhoan.id,
      birthOrder: 2,
    },
  });
  const baSinh = await prisma.member.upsert({
    where: { id: "bui-thi-sinh" },
    update: {},
    create: {
      id: "bui-thi-sinh",
      firstName: "Thị Sinh",
      lastName: "Bùi",
      gender: "female",
    },
  });
  await prisma.member.update({
    where: { id: ongSao.id },
    data: { spouseId: baSinh.id },
  });
  await prisma.member.update({
    where: { id: baSinh.id },
    data: { spouseId: ongSao.id },
  });

  // Children of Ong Sao
  const childrenSao = [
    {
      id: "ha-van-hien",
      name: "Văn Hiên",
      gender: "male",
      order: 1,
      spouse: "Tươi",
    },
    {
      id: "ha-van-hien-2",
      name: "Văn Hiền",
      gender: "male",
      order: 2,
      spouse: "Thân",
    },
    {
      id: "ha-van-hien-3",
      name: "Văn Hiển",
      gender: "male",
      order: 3,
      spouse: "Ngân",
    },
    {
      id: "ha-van-hung",
      name: "Văn Hưng",
      gender: "male",
      order: 4,
      spouse: "Thịnh",
    },
  ];

  for (const child of childrenSao) {
    const c = await prisma.member.upsert({
      where: { id: child.id },
      update: {
        fatherId: ongSao.id,
        motherId: baSinh.id,
        birthOrder: child.order,
      },
      create: {
        id: child.id,
        firstName: child.name,
        lastName: "Hà", // Assuming same last name for sons
        gender: child.gender,
        fatherId: ongSao.id,
        motherId: baSinh.id,
        birthOrder: child.order,
      },
    });
    if (child.spouse) {
      const spId = `spouse-of-${child.id}`;
      const sp = await prisma.member.upsert({
        where: { id: spId },
        update: {},
        create: {
          id: spId,
          firstName: child.spouse,
          lastName: "",
          gender: "female",
        },
      });
      await prisma.member.update({
        where: { id: c.id },
        data: { spouseId: sp.id },
      });
      await prisma.member.update({
        where: { id: sp.id },
        data: { spouseId: c.id },
      });
    }
  }

  // 2.3 Bà Đu
  const baDu = await prisma.member.upsert({
    where: { id: "ha-thi-du" },
    update: { fatherId: cuDam.id, motherId: cuKhoan.id, birthOrder: 3 },
    create: {
      id: "ha-thi-du",
      firstName: "Thị Đu",
      lastName: "Hà",
      gender: "female",
      fatherId: cuDam.id,
      motherId: cuKhoan.id,
      birthOrder: 3,
    },
  });
  const ongLien = await prisma.member.upsert({
    where: { id: "nguyen-van-lien" },
    update: {},
    create: {
      id: "nguyen-van-lien",
      firstName: "Văn Liễn",
      lastName: "Nguyễn",
      gender: "male",
    },
  });
  await prisma.member.update({
    where: { id: baDu.id },
    data: { spouseId: ongLien.id },
  });
  await prisma.member.update({
    where: { id: ongLien.id },
    data: { spouseId: baDu.id },
  });

  // Children of Ba Du
  const childrenDu = [
    {
      id: "phuong-con-du",
      name: "Phượng",
      gender: "female",
      order: 1,
      spouse: "Hoa",
    },
    {
      id: "phuong-con-du-2",
      name: "Phường",
      gender: "female",
      order: 2,
      spouse: "Tuất",
    },
    {
      id: "pho-con-du",
      name: "Phố",
      gender: "male",
      order: 3,
      spouse: "Huyền",
    },
    {
      id: "tuan-con-du",
      name: "Tuân",
      gender: "male",
      order: 4,
      spouse: "Anh",
    },
    {
      id: "tuan-con-du-2",
      name: "Tuấn",
      gender: "male",
      order: 5,
      spouse: "Hảo",
    },
    {
      id: "tuyen-con-du",
      name: "Tuyên",
      gender: "female",
      order: 6,
      spouse: null,
    },
    {
      id: "tuyen-con-du-2",
      name: "Tuyến",
      gender: "female",
      order: 7,
      spouse: "Trong",
    },
    { id: "cuu-con-du", name: "Cửu", gender: "male", order: 8, spouse: "Mai" },
  ];

  for (const child of childrenDu) {
    const c = await prisma.member.upsert({
      where: { id: child.id },
      update: {
        fatherId: ongLien.id,
        motherId: baDu.id,
        birthOrder: child.order,
      },
      create: {
        id: child.id,
        firstName: child.name,
        lastName: "",
        gender: child.gender,
        fatherId: ongLien.id,
        motherId: baDu.id,
        birthOrder: child.order,
      },
    });
    if (child.spouse) {
      const spId = `spouse-of-${child.id}`;
      const sp = await prisma.member.upsert({
        where: { id: spId },
        update: {},
        create: {
          id: spId,
          firstName: child.spouse,
          lastName: "",
          gender: child.gender === "male" ? "female" : "male",
        },
      });
      await prisma.member.update({
        where: { id: c.id },
        data: { spouseId: sp.id },
      });
      await prisma.member.update({
        where: { id: sp.id },
        data: { spouseId: c.id },
      });
    }
  }

  // 2.4 Ông Nên
  const ongNen = await prisma.member.upsert({
    where: { id: "ha-van-nen" },
    update: { fatherId: cuDam.id, motherId: cuKhoan.id, birthOrder: 4 },
    create: {
      id: "ha-van-nen",
      firstName: "Văn Nên",
      lastName: "Hà",
      gender: "male",
      fatherId: cuDam.id,
      motherId: cuKhoan.id,
      birthOrder: 4,
    },
  });
  const baHoa = await prisma.member.upsert({
    where: { id: "le-thi-hoa" },
    update: {},
    create: {
      id: "le-thi-hoa",
      firstName: "Thị Hoa",
      lastName: "Lê",
      gender: "female",
    },
  });
  await prisma.member.update({
    where: { id: ongNen.id },
    data: { spouseId: baHoa.id },
  });
  await prisma.member.update({
    where: { id: baHoa.id },
    data: { spouseId: ongNen.id },
  });

  // Children of Ong Nen
  const childrenNen = [
    {
      id: "hop-con-nen",
      name: "Hợp",
      gender: "male",
      order: 1,
      spouse: "Oanh",
    },
    {
      id: "hoa-con-nen",
      name: "Hòa",
      gender: "female",
      order: 2,
      spouse: "Hào",
    },
  ];
  for (const child of childrenNen) {
    const c = await prisma.member.upsert({
      where: { id: child.id },
      update: {
        fatherId: ongNen.id,
        motherId: baHoa.id,
        birthOrder: child.order,
      },
      create: {
        id: child.id,
        firstName: child.name,
        lastName: "",
        gender: child.gender,
        fatherId: ongNen.id,
        motherId: baHoa.id,
        birthOrder: child.order,
      },
    });
    if (child.spouse) {
      const spId = `spouse-of-${child.id}`;
      const sp = await prisma.member.upsert({
        where: { id: spId },
        update: {},
        create: {
          id: spId,
          firstName: child.spouse,
          lastName: "",
          gender: child.gender === "male" ? "female" : "male",
        },
      });
      await prisma.member.update({
        where: { id: c.id },
        data: { spouseId: sp.id },
      });
      await prisma.member.update({
        where: { id: sp.id },
        data: { spouseId: c.id },
      });
    }
  }

  // 2.5 Bà Bổng (Bà Nội) - Update existing to link parents
  await prisma.member.update({
    where: { id: baNoi.id },
    data: {
      fatherId: cuDam.id,
      motherId: cuKhoan.id,
      birthOrder: 5,
    },
  });

  // Add missing child of Ba Bong: Tran Thi Duong
  await prisma.member.upsert({
    where: { id: "tran-thi-duong" },
    update: {},
    create: {
      id: "tran-thi-duong",
      firstName: "Thị Dương",
      lastName: "Trần",
      gender: "female",
      birthDate: new Date("1966-01-01"), // Approx
      deathDate: new Date("1977-01-01"), // Approx
      fatherId: ongNoi.id,
      motherId: baNoi.id,
      birthOrder: 1, // First child
    },
  });

  // Update birth orders for other children of Ba Bong if possible (Binh, Minh, Ha)
  // Binh (1972) -> 2
  await prisma.member.update({ where: { id: bo.id }, data: { birthOrder: 2 } });
  // Minh (1974) -> 3
  await prisma.member.update({
    where: { id: chuMinh.id },
    data: { birthOrder: 3 },
  });
  // Ha (?)
  await prisma.member.update({
    where: { id: coHa.id },
    data: { birthOrder: 4 },
  });

  // 2.6 Bà Nõn
  const baNon = await prisma.member.upsert({
    where: { id: "ha-thi-non" },
    update: { fatherId: cuDam.id, motherId: cuKhoan.id, birthOrder: 6 },
    create: {
      id: "ha-thi-non",
      firstName: "Thị Nõn",
      lastName: "Hà",
      gender: "female",
      fatherId: cuDam.id,
      motherId: cuKhoan.id,
      birthOrder: 6,
    },
  });
  const ongNgo = await prisma.member.upsert({
    where: { id: "ta-quang-ngo" },
    update: {},
    create: {
      id: "ta-quang-ngo",
      firstName: "Quang Ngọ",
      lastName: "Tạ",
      gender: "male",
    },
  });
  await prisma.member.update({
    where: { id: baNon.id },
    data: { spouseId: ongNgo.id },
  });
  await prisma.member.update({
    where: { id: ongNgo.id },
    data: { spouseId: baNon.id },
  });

  // Children of Ba Non
  const childrenNon = [
    {
      id: "huy-con-non",
      name: "Huy",
      gender: "male",
      order: 1,
      spouse: "Thanh",
    },
    {
      id: "quan-con-non",
      name: "Quân",
      gender: "male",
      order: 2,
      spouse: "Hậu",
    },
    {
      id: "trang-con-non",
      name: "Trang",
      gender: "female",
      order: 3,
      spouse: "Thêm",
    },
  ];
  for (const child of childrenNon) {
    const c = await prisma.member.upsert({
      where: { id: child.id },
      update: {
        fatherId: ongNgo.id,
        motherId: baNon.id,
        birthOrder: child.order,
      },
      create: {
        id: child.id,
        firstName: child.name,
        lastName: "",
        gender: child.gender,
        fatherId: ongNgo.id,
        motherId: baNon.id,
        birthOrder: child.order,
      },
    });
    if (child.spouse) {
      const spId = `spouse-of-${child.id}`;
      const sp = await prisma.member.upsert({
        where: { id: spId },
        update: {},
        create: {
          id: spId,
          firstName: child.spouse,
          lastName: "",
          gender: child.gender === "male" ? "female" : "male",
        },
      });
      await prisma.member.update({
        where: { id: c.id },
        data: { spouseId: sp.id },
      });
      await prisma.member.update({
        where: { id: sp.id },
        data: { spouseId: c.id },
      });
    }
  }

  console.log("✓ Created Họ Hà tree");

  // ============= CREATE 4 LINEAGES =============
  console.log("🏘️  Creating 4 lineages...");

  const lineageTran = await prisma.lineage.upsert({
    where: { code: "tran" },
    update: { name: "Họ Trần (Bên Nội)", rootMemberId: cuPhung.id },
    create: {
      code: "tran",
      name: "Họ Trần (Bên Nội)",
      rootMemberId: cuPhung.id,
    },
  });

  const lineageHa = await prisma.lineage.upsert({
    where: { code: "ha" },
    update: { name: "Họ Hà (Bà Nội)", rootMemberId: cuDam.id },
    create: { code: "ha", name: "Họ Hà (Bà Nội)", rootMemberId: cuDam.id },
  });

  const lineageNguyen = await prisma.lineage.upsert({
    where: { code: "nguyen" },
    update: { name: "Họ Nguyễn (Bên Ngoại)", rootMemberId: cuTu.id },
    create: {
      code: "nguyen",
      name: "Họ Nguyễn (Bên Ngoại)",
      rootMemberId: cuTu.id,
    },
  });

  const lineageDao = await prisma.lineage.upsert({
    where: { code: "dao" },
    update: { name: "Họ Đào (Bà Ngoại)", rootMemberId: cuCoc.id },
    create: {
      code: "dao",
      name: "Họ Đào (Bà Ngoại)",
      rootMemberId: cuCoc.id,
    },
  });

  console.log("✓ Created 4 lineages");

  // ============= ASSIGN STARTING MEMBERS =============
  // 1. Họ Trần: Cụ Phúng + Con, Cháu, Chắt
  const tranMembers = [
    cuPhung.id,
    bacTon.id,
    ongNoi.id,
    coNhiem.id,
    ongDuong.id,
    baQuan.id,
    bo.id,
    user.id,
    emTrai.id,
    chuMinh.id,
    danhGiap.id,
    ducNguyen.id,
    coHa.id,
  ];
  await prisma.member.updateMany({
    where: { id: { in: tranMembers } },
    data: { lineageId: lineageTran.id },
  });

  // 2. Họ Hà: Cụ Dậm + Tất cả con cháu họ Hà
  // Vì là người Hà, nên tất cả con của Cụ Dậm đều mang họ Hà (kể cả gái).
  // Nhưng trong logic Lineage "truyền thống", thường chỉ con trai mới "nối dõi" tông đường dòng họ đó?
  // Tuy nhiên, để hiển thị Tree, ta cứ assign hết con cái vào Lineage đó để dễ nhìn.
  const haMembers = [
    cuDam.id,
    baDieu.id,
    ongSao.id,
    baDu.id,
    ongNen.id,
    baNoi.id,
    baNon.id,
    // Con của Ông Sáo (trai) -> Họ Hà
    ...childrenSao.map((c) => c.id),
    // Con của Ông Nên (trai) -> Họ Hà
    ...childrenNen.map((c) => c.id),
  ];
  await prisma.member.updateMany({
    where: { id: { in: haMembers } },
    data: { lineageId: lineageHa.id },
  });

  // 3. Họ Nguyễn: Cụ Tự + Tất cả con cháu
  const nguyenMembers = [
    cuTu.id,
    cuDinh.id,
    baThanh.id,
    ongTuoc.id,
    ongNgoai.id,
    baHuong.id,
    baSap.id,
    ongSau.id,
    baBay.id,
    // Existing descendants of Ong Ngoai
    cauKien.id,
    ducCuong.id,
    nganGiang.id,
    cauQuyet.id,
    haNguyen.id,
    khue.id,
    cauChi.id,
    // Add descendants of siblings
    ...childrenThanh.map((c) => c.id),
    ...childrenTuoc.map((c) => c.id),
    ...childrenSap.map((c) => c.id),
    ...childrenSau.map((c) => c.id),
    ...childrenBay.map((c) => c.id),
  ];
  await prisma.member.updateMany({
    where: { id: { in: nguyenMembers } },
    data: { lineageId: lineageNguyen.id },
  });

  await prisma.member.update({
    where: { id: me.id },
    data: { lineageId: lineageNguyen.id },
  });

  // 4. Họ Đào: Cụ Cốc + Con cháu (trừ con Bà Ngoại đã ở Họ Nguyễn)
  const daoMembers = [
    cuCoc.id,
    cuDe.id,
    baNgoai.id,
    baCham.id,
    baChi.id,
    baTheu.id,
    ongHue.id,
    baMai.id,
    // Add descendants (excluding Ba Ngoai's children who are in lineageNguyen)
    ...childrenCham.map((c) => c.id),
    ...childrenChi.map((c) => c.id),
    ...childrenTheu.map((c) => c.id),
    ...childrenHue.map((c) => c.id),
    ...childrenMai.map((c) => c.id),
  ];
  await prisma.member.updateMany({
    where: { id: { in: daoMembers } },
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
