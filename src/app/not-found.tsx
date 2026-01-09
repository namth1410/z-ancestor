"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "var(--font-sans)",
        background: "linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)",
        padding: "2rem",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "600px",
        }}
      >
        <h1
          style={{
            fontSize: "8rem",
            fontWeight: "bold",
            color: "#8c7356",
            margin: 0,
            fontFamily: "var(--font-serif)",
          }}
        >
          404
        </h1>

        <h2
          style={{
            fontSize: "2rem",
            color: "#44403c",
            marginTop: "1rem",
            marginBottom: "1rem",
            fontFamily: "var(--font-serif)",
          }}
        >
          Không tìm thấy trang
        </h2>

        <p
          style={{
            fontSize: "1.125rem",
            color: "#78716c",
            marginBottom: "2rem",
            lineHeight: "1.75",
          }}
        >
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>

        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "0.75rem 2rem",
            backgroundColor: "#8c7356",
            color: "white",
            textDecoration: "none",
            borderRadius: "0.5rem",
            fontSize: "1rem",
            fontWeight: "500",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#78614a";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#8c7356";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          ← Về Trang Chủ
        </Link>
      </div>
    </div>
  );
}
