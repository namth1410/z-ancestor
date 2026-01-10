import Link from "next/link";
import style from "./page.module.scss";

const LINEAGES = [
  {
    id: "ha",
    name: "Họ Hà",
    desc: "Gia phả họ Hà (Bà Nội)",
    gradientClass: style.gradientHa,
    icon: "H",
  },
  {
    id: "tran",
    name: "Họ Trần",
    desc: "Gia phả họ Trần (Ông Nội)",
    gradientClass: style.gradientTran,
    icon: "T",
  },
  {
    id: "dao",
    name: "Họ Đào",
    desc: "Gia phả họ Đào (Bà Ngoại)",
    gradientClass: style.gradientDao,
    icon: "Đ",
  },
  {
    id: "nguyen",
    name: "Họ Nguyễn",
    desc: "Gia phả họ Nguyễn (Ông Ngoại)",
    gradientClass: style.gradientNgoai,
    icon: "N",
  },
];

export default function LandingPage() {
  return (
    <main className={style.main}>
      {/* Background Ambience */}
      <div className={style.bgPattern}></div>
      <div className={style.bgGlow1}></div>
      <div className={style.bgGlow2}></div>

      <div className={style.header}>
        <h1 className={style.title}>
          <span className={style.highlight}>Gia Phả</span> Dòng Tộc
        </h1>
        <p className={style.subtitle}>
          &quot;Cây có gốc mới nở cành xanh ngọn
          <br />
          Nước có nguồn mới bể rộng sông sâu&quot;
        </p>
      </div>

      <div className={style.grid}>
        {LINEAGES.map((lineage) => (
          <Link
            key={lineage.id}
            href={`/tree/${lineage.id}`}
            className={style.card}
          >
            {/* Card Background */}
            <div className={`${style.cardBg} ${lineage.gradientClass}`}></div>

            {/* Hover Glow */}
            <div className={style.hoverGlow}></div>

            {/* Content */}
            <div className={style.cardContent}>
              <div className={style.iconWrapper}>{lineage.icon}</div>

              <h2 className={style.cardTitle}>{lineage.name}</h2>
              <p className={style.cardDesc}>{lineage.desc}</p>

              <div className={style.cta}>Xem Gia Phả</div>
            </div>
          </Link>
        ))}
      </div>

      <footer className={style.footer}>
        © {new Date().getFullYear()} Ancestry Archive. Preserving Heritage.
      </footer>
    </main>
  );
}
