"use client";

import React, { useState } from "react";
import style from "./MemberDrawer.module.scss";
import { X, Trash2, UserPlus } from "lucide-react";
import { Member } from "@prisma/client";
import MemberForm from "../MemberForm/MemberForm";
import clsx from "clsx";

interface MemberDrawerProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  // actions
  onDelete: (id: string) => void;
  onDataChange: () => void;

  // Data for editing
  members: Member[];

  // Modes
  mode: "view" | "edit" | "create";
  onSwitchMode: (mode: "view" | "edit" | "create") => void;

  // New props for integrated form logic
  defaultValues?: Partial<Member>;
  onAddRelative?: (type: "child" | "spouse" | "parent", member: Member) => void;
  isAdmin: boolean;
  lineages?: { id: string; name: string }[];
}

const MemberDrawer = ({
  member,
  isOpen,
  onClose,
  onDelete,
  onDataChange,
  members,
  mode,
  // onSwitchMode, // Unused
  defaultValues,
  onAddRelative,
  isAdmin,
  lineages,
}: MemberDrawerProps) => {
  // Use render-time state update to cache member
  const [cachedMember, setCachedMember] = useState<Member | null>(member);

  if (member && member.id !== cachedMember?.id) {
    setCachedMember(member);
  }

  const displayedMember = member || cachedMember;

  const handleClose = () => {
    onClose();
  };

  const isCreating = mode === "create";
  // If we are creating, readOnly is false (always editable).
  // If we are "viewing/editing" an existing member, readOnly depends on isAdmin.
  const isReadOnly = !isCreating && !isAdmin;

  return (
    <>
      {/* Overlay */}
      <div
        className={clsx(style.drawerOverlay, isOpen && style.open)}
        onClick={handleClose}
      />

      {/* Drawer Panel */}
      <aside className={clsx(style.drawer, isOpen && style.open)}>
        <div className={style.header}>
          <h2>{isCreating ? "Thêm Thành Viên" : "Thông Tin Chi Tiết"}</h2>
          <button className={style.closeBtn} onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <div className={style.content}>
          <div className={style.formWrapper}>
            <MemberForm
              key={`${mode}-${member?.id || "new"}-${isOpen}`}
              member={isCreating ? null : displayedMember}
              members={members}
              lineages={lineages}
              defaultValues={defaultValues}
              onClose={handleClose}
              onSuccess={() => {
                onDataChange();
                // If success create, drawer closes or switches
              }}
              readOnly={isReadOnly}
            />
          </div>
        </div>

        {/* Footer Actions: Only show if NOT creating (existing member) AND IS ADMIN */}
        {!isCreating && displayedMember && isAdmin && (
          <div className={style.footer}>
            {/* If ReadOnly (Locked), we still show "Add Child" / "Delete" but they might trigger password prompt handled by parent */}
            <button
              className="btn bg-stone-100 text-stone-700 hover:bg-stone-200 flex-1 justify-center"
              onClick={() => onAddRelative?.("child", displayedMember)}
            >
              <UserPlus size={16} className="mr-2" /> Thêm Con
            </button>

            <button
              className="btn bg-red-50 text-red-600 hover:bg-red-100 justify-center"
              onClick={() => {
                if (!isAdmin) {
                  // Trigger unlock via specific callback or just let parent handle?
                  // Parent callback `onDelete` can handle check, but here we might want to prompt first?
                  // Actually `onSwitchMode` had checks. `onDelete` might not.
                  // For now, assume user must unlock first relative to FamilyTree logic or we prompt here?
                  // FamilyTree logic handles `onAddRelative` checks.
                  // `onDelete` check:
                  if (
                    confirm(
                      "Bạn có chắc chắn muốn xóa thành viên này và toàn bộ nhánh con?"
                    )
                  ) {
                    onDelete(displayedMember.id);
                  }
                } else {
                  if (
                    confirm(
                      "Bạn có chắc chắn muốn xóa thành viên này và toàn bộ nhánh con?"
                    )
                  ) {
                    onDelete(displayedMember.id);
                  }
                }
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default MemberDrawer;
