"use client";

import { useState } from "react";
import { Member } from "@prisma/client";
import { deleteMember } from "@/actions/members";
import MemberDrawer from "@/components/MemberDrawer/MemberDrawer";
import { Pencil, Trash2, Plus } from "lucide-react";

type LineageInfo = {
  id: string;
  code: string;
  name: string;
};

export default function MembersTab({
  members,
  lineages,
}: {
  members: Member[];
  lineages: LineageInfo[];
}) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "create">(
    "view"
  );

  const [searchQuery, setSearchQuery] = useState("");

  const handleCreate = () => {
    setSelectedMember(null);
    setDrawerMode("create");
    setIsDrawerOpen(true);
  };

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setDrawerMode("edit");
    setIsDrawerOpen(true);
  };

  const handleDelete = async (memberId: string) => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn xóa thành viên này? Hành động này không thể hoàn tác."
      )
    ) {
      return;
    }

    // Call server action
    await deleteMember(memberId);
    window.location.reload();
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedMember(null);
  };

  const handleDataChange = () => {
    window.location.reload();
  };

  // Filter members
  const filteredMembers = members.filter((m) => {
    const fullName = `${m.lastName} ${m.firstName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const styles = {
    container: {
      backgroundColor: "#fff",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      border: "1px solid #e5e7eb",
      overflow: "hidden" as const,
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse" as const,
    },
    thead: {
      backgroundColor: "#f9fafb",
      borderBottom: "1px solid #e5e7eb",
    },
    th: {
      padding: "12px 24px",
      textAlign: "left" as const,
      fontSize: "12px",
      fontWeight: 500,
      color: "#6b7280",
      textTransform: "uppercase" as const,
    },
    td: {
      padding: "16px 24px",
      fontSize: "14px",
      borderTop: "1px solid #e5e7eb",
    },
    actionBtn: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "6px",
      borderRadius: "4px",
      border: "none",
      cursor: "pointer",
      marginLeft: "8px",
    },
    input: {
      padding: "8px 12px",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      width: "300px",
    },
  };

  return (
    <div>
      <div style={styles.header}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "#1f2937",
              margin: 0,
            }}
          >
            Tất cả thành viên ({members.length})
          </h2>
          <input
            type="text"
            placeholder="Tìm kếm tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.input}
          />
        </div>

        <button
          onClick={handleCreate}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <Plus size={18} /> Thêm Thành Viên
        </button>
      </div>

      {members.length === 0 ? (
        <div
          style={{
            padding: "48px",
            textAlign: "center",
            color: "#6b7280",
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <p style={{ marginBottom: "8px" }}>
            Chưa có thành viên nào trong database.
          </p>
          <p style={{ fontSize: "14px" }}>
            Database đã bị reset - cần chạy lại seed script để thêm data mẫu.
          </p>
        </div>
      ) : (
        <div style={styles.container}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Họ Tên</th>
                <th style={styles.th}>Họ (Lineage)</th>
                <th style={styles.th}>Bố</th>
                <th style={styles.th}>Mẹ</th>
                <th style={styles.th}>Vợ/Chồng</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => {
                const lineage = lineages.find((l) => l.id === member.lineageId);
                const father = members.find((m) => m.id === member.fatherId);
                const mother = members.find((m) => m.id === member.motherId);
                const spouse = members.find((m) => m.id === member.spouseId);

                return (
                  <tr key={member.id}>
                    <td style={{ ...styles.td, fontWeight: 500 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {member.avatar && (
                          <img
                            src={member.avatar}
                            alt=""
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        )}
                        {member.lastName} {member.firstName}
                      </div>
                    </td>
                    <td style={styles.td}>{lineage?.name || "-"}</td>
                    <td style={styles.td}>
                      {father ? `${father.lastName} ${father.firstName}` : "-"}
                    </td>
                    <td style={styles.td}>
                      {mother ? `${mother.lastName} ${mother.firstName}` : "-"}
                    </td>
                    <td style={styles.td}>
                      {spouse ? `${spouse.lastName} ${spouse.firstName}` : "-"}
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "flex" }}>
                        <button
                          onClick={() => handleEdit(member)}
                          style={{
                            ...styles.actionBtn,
                            color: "#2563eb",
                            backgroundColor: "#eff6ff",
                          }}
                          title="Sửa"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          style={{
                            ...styles.actionBtn,
                            color: "#dc2626",
                            backgroundColor: "#fef2f2",
                          }}
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <MemberDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        member={selectedMember}
        members={members} // Pass full list for relations
        mode={drawerMode}
        onSwitchMode={(mode) => setDrawerMode(mode)}
        onDelete={handleDelete}
        onDataChange={handleDataChange}
        isAdmin={true} // Admin page always admin logic
        lineages={lineages}
        // defaultValues
      />
    </div>
  );
}
