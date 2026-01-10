"use client";

import React, { useState, useEffect } from "react";
import { Member } from "@prisma/client";
import { X, Search, ArrowRight, User } from "lucide-react";
import { normalizeString } from "@/lib/utils";
import { calculateRelationship } from "@/actions/relationship";
import styles from "./RelationshipModal.module.scss";

interface RelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  initialSourceId?: string;
}

export default function RelationshipModal({
  isOpen,
  onClose,
  members,
  initialSourceId,
}: RelationshipModalProps) {
  const [sourceId, setSourceId] = useState<string>("");
  const [targetId, setTargetId] = useState<string>("");

  const [result, setResult] = useState<{
    relationshipName: string;
    pathDescription: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && initialSourceId) {
      setSourceId(initialSourceId);
    } else if (!isOpen) {
      setResult(null);
    }
  }, [isOpen, initialSourceId]);

  const handleCalculate = async () => {
    if (!sourceId || !targetId) return;
    if (sourceId === targetId) {
      setResult({ relationshipName: "Bản thân", pathDescription: [] });
      return;
    }

    setLoading(true);
    try {
      const resp = await calculateRelationship(sourceId, targetId);
      if (resp.success && resp.data) {
        setResult({
          relationshipName: resp.data.relationshipName,
          pathDescription: resp.data.pathDescription,
        });
      } else {
        setResult({ relationshipName: "Không xác định", pathDescription: [] });
      }
    } catch (e) {
      console.error(e);
      setResult({ relationshipName: "Lỗi tính toán", pathDescription: [] });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2>
            <User size={20} />
            Tra Cứu Quan Hệ
          </h2>
          <button onClick={onClose} className={styles.closeParams}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <div className={styles.inputsGrid}>
            {/* Person A */}
            <MemberSelect
              label="Người thứ nhất (A)"
              members={members}
              value={sourceId}
              onChange={setSourceId}
            />

            {/* Person B */}
            <MemberSelect
              label="Người thứ hai (B)"
              members={members}
              value={targetId}
              onChange={setTargetId}
            />
          </div>

          <button
            onClick={handleCalculate}
            disabled={!sourceId || !targetId || loading}
            className={styles.calcButton}
          >
            {loading ? "Đang tính toán..." : "A gọi B là gì?"}
          </button>

          {/* Result */}
          {result && (
            <div className={styles.resultBox}>
              <div className={styles.resultLabel}>Kết quả tra cứu</div>
              <div className={styles.resultName}>{result.relationshipName}</div>
              {result.pathDescription.length > 0 && (
                <div className={styles.path}>
                  <span>(A)</span>
                  {result.pathDescription.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <ArrowRight size={12} color="#9ca3af" />
                      <span
                        style={{
                          fontWeight:
                            idx === result.pathDescription.length - 1
                              ? 600
                              : 400,
                        }}
                      >
                        {step}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component for Searchable Select
function MemberSelect({
  label,
  members,
  value,
  onChange,
}: {
  label: string;
  members: Member[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedMember = members.find((m) => m.id === value);
  const filtered = members.filter((m) => {
    const fullName = normalizeString(`${m.lastName} ${m.firstName}`);
    const q = normalizeString(query);
    return fullName.includes(q);
  });

  return (
    <div className={styles.selectWrapper}>
      <label className={styles.label}>{label}</label>

      {/* Trigger */}
      <div className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
        {selectedMember ? (
          <div className={styles.selectedMember}>
            <img
              src={selectedMember.avatar || "/default-avatar.svg"}
              alt={selectedMember.firstName}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span style={{ fontWeight: 500 }}>
              {selectedMember.lastName} {selectedMember.firstName}
            </span>
          </div>
        ) : (
          <span className={styles.placeholder}>Chọn thành viên...</span>
        )}
        <Search size={16} className="text-gray-400" />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 5 }}
            onClick={() => setIsOpen(false)}
          />
          <div className={styles.dropdown}>
            <div
              style={{
                padding: "0.5rem",
                position: "sticky",
                top: 0,
                background: "white",
                borderBottom: "1px solid #eee",
              }}
            >
              <input
                type="text"
                placeholder="Tìm tên..."
                className={styles.searchInput}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: "0.75rem",
                  textAlign: "center",
                  color: "#999",
                  fontSize: "0.875rem",
                }}
              >
                Không tìm thấy
              </div>
            ) : (
              filtered.map((m) => (
                <div
                  key={m.id}
                  className={styles.dropdownItem}
                  onClick={() => {
                    onChange(m.id);
                    setIsOpen(false);
                  }}
                >
                  <img
                    src={m.avatar || "/default-avatar.svg"}
                    alt={m.firstName}
                  />
                  <div className={styles.info}>
                    <div className={styles.name}>
                      {m.lastName} {m.firstName}
                    </div>
                    <div className={styles.meta}>
                      {m.birthDate ? new Date(m.birthDate).getFullYear() : "?"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
