import { getLineages } from "@/actions/lineages";
import { getMembers } from "@/actions/members";
import LineagesTab from "./_components/LineagesTab";
import MembersTab from "./_components/MembersTab";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "lineages" } = await searchParams;
  const { data: lineages = [] } = await getLineages();
  const { data: members = [] } = await getMembers();

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#fafaf9",
        padding: "32px",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "30px",
            fontWeight: 700,
            color: "#1c1917",
            marginBottom: "32px",
          }}
        >
          Quản Trị Gia Phả
        </h1>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "24px",
            borderBottom: "1px solid #e7e5e4",
          }}
        >
          <a
            href="/admin?tab=lineages"
            style={{
              padding: "12px 24px",
              fontWeight: 500,
              transition: "colors",
              textDecoration: "none",
              color: tab === "lineages" ? "#1c1917" : "#78716c",
              borderBottom: tab === "lineages" ? "2px solid #1c1917" : "none",
            }}
          >
            Họ
          </a>
          <a
            href="/admin?tab=members"
            style={{
              padding: "12px 24px",
              fontWeight: 500,
              transition: "colors",
              textDecoration: "none",
              color: tab === "members" ? "#1c1917" : "#78716c",
              borderBottom: tab === "members" ? "2px solid #1c1917" : "none",
            }}
          >
            Thành Viên
          </a>
        </div>

        {/* Tab Content */}
        {tab === "lineages" ? (
          <LineagesTab lineages={lineages} members={members} />
        ) : (
          <MembersTab members={members} lineages={lineages} />
        )}
      </div>
    </main>
  );
}
