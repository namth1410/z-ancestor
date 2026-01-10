"use client";

import { useState } from "react";
import { Member } from "@prisma/client";
import {
  assignMembersToLineage,
  updateLineageData,
  deleteLineage,
} from "@/actions/lineages";

type LineageWithCount = {
  id: string;
  code: string;
  name: string;
  rootMemberId: string | null;
  rootMember: Member | null;
  _count: { members: number };
};

export default function LineagesTab({
  lineages,
  members,
}: {
  lineages: LineageWithCount[];
  members: Member[];
}) {
  const [selectedLineage, setSelectedLineage] = useState<string | null>(null);
  const [editingLineage, setEditingLineage] = useState<LineageWithCount | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ code: "", name: "" });
  const [editForm, setEditForm] = useState({ name: "", rootMemberId: "" });
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");

  const handleManageMembers = async (lineage: LineageWithCount) => {
    const currentMembers = members.filter((m) => m.lineageId === lineage.id);
    setSelectedMembers(new Set(currentMembers.map((m) => m.id)));
    setSelectedLineage(lineage.id);
  };

  const handleEdit = (lineage: LineageWithCount) => {
    setEditingLineage(lineage);
    setEditForm({
      name: lineage.name,
      rootMemberId: lineage.rootMemberId || "",
    });
  };

  const handleCreate = () => {
    setCreateForm({ code: "", name: "" });
    setIsCreating(true);
  };

  const handleSaveCreate = async () => {
    if (!createForm.code || !createForm.name) {
      alert("Vui lòng nhập đầy đủ Code và Tên!");
      return;
    }

    const { createLineageData } = await import("@/actions/lineages");
    const result = await createLineageData(createForm);

    if (result.success) {
      setIsCreating(false);
      window.location.reload();
    } else {
      alert(result.error || "Có lỗi xảy ra!");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingLineage) return;
    await updateLineageData(editingLineage.id, {
      name: editForm.name,
      rootMemberId: editForm.rootMemberId || null,
    });
    setEditingLineage(null);
    window.location.reload();
  };

  const handleDelete = async (lineageId: string) => {
    if (!confirm("Bạn có chắc muốn xóa dòng họ này?")) return;
    await deleteLineage(lineageId);
    window.location.reload();
  };

  const handleSaveMembers = async () => {
    if (!selectedLineage) return;
    await assignMembersToLineage(selectedLineage, Array.from(selectedMembers));
    setSelectedLineage(null);
    window.location.reload();
  };

  const filteredMembers = members.filter((m) =>
    `${m.lastName} ${m.firstName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const styles = {
    container: {
      backgroundColor: "#fff",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      border: "1px solid #e5e7eb",
      overflow: "hidden" as const,
    },
    table: { width: "100%", borderCollapse: "collapse" as const },
    thead: { backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" },
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
    button: {
      color: "#2563eb",
      fontWeight: 500,
      cursor: "pointer",
      background: "none",
      border: "none",
      padding: 0,
    },
    modal: {
      position: "fixed" as const,
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
    },
    modalContent: {
      backgroundColor: "#fff",
      borderRadius: "8px",
      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
      maxWidth: "672px",
      width: "100%",
      maxHeight: "80vh",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column" as const,
    },
    input: {
      width: "100%",
      padding: "8px 16px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      outline: "none",
    },
    checkboxLabel: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px",
      cursor: "pointer",
      borderRadius: "8px",
    },
  };

  return (
    <div>
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={handleCreate}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          + Thêm Họ
        </button>
      </div>

      {lineages.length === 0 ? (
        <div style={{ padding: "48px", textAlign: "center", color: "#6b7280" }}>
          Chưa có dòng họ nào. Database đã bị reset - cần seed lại data.
        </div>
      ) : (
        <div style={styles.container}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Tên</th>
                <th style={styles.th}>Root</th>
                <th style={styles.th}>Số Người</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lineages.map((lineage) => (
                <tr key={lineage.id}>
                  <td style={{ ...styles.td, fontFamily: "monospace" }}>
                    {lineage.code}
                  </td>
                  <td style={{ ...styles.td, fontWeight: 500 }}>
                    {lineage.name}
                  </td>
                  <td style={styles.td}>
                    {lineage.rootMember
                      ? `${lineage.rootMember.lastName} ${lineage.rootMember.firstName}`
                      : "Chưa có"}
                  </td>
                  <td style={styles.td}>{lineage._count.members}</td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        onClick={() => handleManageMembers(lineage)}
                        style={styles.button}
                      >
                        Thành Viên
                      </button>
                      <button
                        onClick={() => handleEdit(lineage)}
                        style={{ ...styles.button, color: "#059669" }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(lineage.id)}
                        style={{ ...styles.button, color: "#dc2626" }}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Lineage Modal */}
      {isCreating && (
        <div style={styles.modal}>
          <div style={{ ...styles.modalContent, maxWidth: "500px" }}>
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <h3 style={{ fontSize: "18px", fontWeight: 600 }}>Thêm Họ Mới</h3>
            </div>
            <div
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                >
                  Code (URL slug) <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="text"
                  value={createForm.code}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, code: e.target.value })
                  }
                  style={styles.input}
                  placeholder="ha, tran, nguyen..."
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                >
                  Tên hiển thị <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  style={styles.input}
                  placeholder="Họ Nguyễn"
                />
              </div>
            </div>
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <button
                onClick={() => setIsCreating(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#f3f4f6",
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveCreate}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lineage Modal */}
      {editingLineage && (
        <div style={styles.modal}>
          <div style={{ ...styles.modalContent, maxWidth: "500px" }}>
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <h3 style={{ fontSize: "18px", fontWeight: 600 }}>
                Chỉnh Sửa Dòng Họ
              </h3>
            </div>
            <div
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                >
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  style={styles.input}
                  placeholder="Họ Nguyễn"
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                >
                  Root Member (Tổ tiên đầu dòng)
                </label>
                <select
                  value={editForm.rootMemberId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, rootMemberId: e.target.value })
                  }
                  style={{ ...styles.input, cursor: "pointer" }}
                >
                  <option value="">-- Chưa chọn --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.lastName} {m.firstName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <button
                onClick={() => setEditingLineage(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#f3f4f6",
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Assignment Popup */}
      {selectedLineage && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <h3 style={{ fontSize: "18px", fontWeight: 600 }}>
                Quản Lý Thành Viên Họ
              </h3>
            </div>
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <input
                type="text"
                placeholder="Tìm kiếm thành viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
              {filteredMembers.map((member) => (
                <label key={member.id} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedMembers.has(member.id)}
                    onChange={(e) => {
                      const newSet = new Set(selectedMembers);
                      if (e.target.checked) newSet.add(member.id);
                      else newSet.delete(member.id);
                      setSelectedMembers(newSet);
                    }}
                    style={{ width: "20px", height: "20px" }}
                  />
                  <span style={{ fontSize: "14px" }}>
                    {member.lastName} {member.firstName}
                  </span>
                </label>
              ))}
            </div>
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <button
                onClick={() => setSelectedLineage(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#f3f4f6",
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveMembers}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
