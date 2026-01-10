import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.scss";
import "reactflow/dist/style.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
});
const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://z-ancestor.namth.online"),
  title: "Gia Phả Gen Z - Lưu Giữ Gia Phả Số",
  description:
    "Gia Phả Gen Z - Ứng dụng xem và quản lý gia phả dòng họ trực tuyến dành cho thế hệ trẻ. Lưu giữ và phát huy truyền thống uống nước nhớ nguồn.",
  keywords: [
    "gia phả gen z",
    "gia phả",
    "gia phả online",
    "cây gia phả",
    "gia phả số",
    "family tree",
    "lập gia phả",
    "quản lý gia phả",
    "dòng họ",
  ],
  openGraph: {
    title: "Gia Phả Gen Z - Lưu Giữ Gia Phả Số",
    description:
      "Khám phá và lưu giữ những giá trị truyền thống của dòng họ theo cách hiện đại. Cây có gốc mới nở cành xanh ngọn, nước có nguồn mới bể rộng sông sâu.",
    url: "https://z-ancestor.namth.online",
    siteName: "Gia Phả Gen Z",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Gia Phả Gen Z - Lưu Giữ Gia Phả Số",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gia Phả Gen Z",
    description: "Lưu giữ và phát huy truyền thống dòng họ theo cách Gen Z.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Favicons - Multiple sizes for browser compatibility */}
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="48x48"
          href="/favicon-48x48.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="64x64"
          href="/favicon-64x64.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="128x128"
          href="/favicon-128x128.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="256x256"
          href="/favicon-256x256.png"
        />

        {/* Apple Touch Icons */}
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/apple-touch-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/apple-touch-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="/apple-touch-icon-167x167.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon-180x180.png"
        />

        {/* Android/Chrome */}
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-chrome-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/android-chrome-512x512.png"
        />

        {/* Web App Manifest */}
        <link rel="manifest" href="/site.webmanifest" />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#8c7356" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Gia Phả Gen Z",
              alternateName: "Gia Phả Gen Z - Lưu Giữ Gia Phả Số",
              url: "https://z-ancestor.namth.online",
              description:
                "Ứng dụng xem và quản lý gia phả dòng họ trực tuyến dành cho thế hệ trẻ.",
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
