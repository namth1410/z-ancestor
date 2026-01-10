import { isAuthenticated } from "@/actions/auth";
import FamilyTree from "@/components/FamilyTree/FamilyTree";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Query lineage from database
  const lineage = await db.lineage.findUnique({
    where: { code: id },
  });

  const name = lineage?.name || "Dòng Họ";
  const url = `https://z-ancestor.namth.online/tree/${id}`;

  return {
    title: `Gia Phả ${name} - Ancestry Archive`,
    description: `Xem chi tiết cây gia phả của ${name}. Danh sách thành viên và mối quan hệ huyết thống.`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `Gia Phả ${name}`,
      description: `Cây gia phả chi tiết của ${name}.`,
      url: url,
      images: ["/og-image.png"],
    },
  };
}

export default async function TreePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isAdmin = await isAuthenticated();

  // Load recursive lineage data using action
  const { getLineage } = await import("@/actions/lineages");
  const result = await getLineage(id);
  const lineage = result.success ? result.data : null;

  const members = lineage?.members || [];
  const name = lineage?.name || "Dòng Họ";

  // Structured data for breadcrumbs
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: "https://z-ancestor.namth.online",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `Gia Phả ${name}`,
      },
    ],
  };

  return (
    <main style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <FamilyTree initialMembers={members || []} initialIsAdmin={isAdmin} />
    </main>
  );
}
