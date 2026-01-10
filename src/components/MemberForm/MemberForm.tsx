"use client";

import React, { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Member } from "@prisma/client";
import { createMember, updateMember } from "@/actions/members";
import styles from "./MemberForm.module.scss";
import { Save, Upload } from "lucide-react";

interface MemberFormProps {
  member?: Member | null; // If null, creating new
  members: Member[]; // For selecting relations
  lineages?: { id: string; name: string }[]; // Optional for now to avoid breaking existing usage
  defaultValues?: Partial<Member>;
  onClose: () => void;
  onSuccess: () => void;
  readOnly?: boolean;
}

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary" disabled={pending}>
      <Save size={16} /> {pending ? "Đang lưu..." : "Lưu thông tin"}
    </button>
  );
};

const MemberForm = ({
  member,
  members,
  lineages,
  defaultValues,
  onClose,
  onSuccess,
  readOnly = false,
}: MemberFormProps) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    member?.avatar || defaultValues?.avatar || null
  );

  const action = member ? updateMember.bind(null, member.id) : createMember;

  const [state, formAction] = useFormState(action, {
    success: false,
    error: "",
  });

  useEffect(() => {
    if (state.success) {
      onSuccess();
      onClose();
    } else if (state.error) {
      alert(state.error); // Simple alert for Lite version
    }
  }, [state, onClose, onSuccess]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className={styles.formContainer}>
      <form action={formAction}>
        {/* Hidden inputs for relations: Preserve spouseId if exists (since we don't have a selector for it yet) */}
        {(member?.spouseId || defaultValues?.spouseId) && (
          <input
            type="hidden"
            name="spouseId"
            value={member?.spouseId || defaultValues?.spouseId || ""}
          />
        )}

        {/* For Parent IDs, we rely on the Select inputs below, but for defaultValues (Create Child), we need hidden inputs if Selects are hidden */}
        {/* Actually, existing code Logic for Select visibility is based on defaultValues. Let's keep it simple: */}
        {defaultValues?.fatherId && (
          <input type="hidden" name="fatherId" value={defaultValues.fatherId} />
        )}
        {defaultValues?.motherId && (
          <input type="hidden" name="motherId" value={defaultValues.motherId} />
        )}

        <div className={styles.formGroup}>
          <label>Ảnh đại diện</label>
          <div className={styles.avatarUpload}>
            <img
              src={avatarPreview || "/default-avatar.svg"}
              alt="Avatar Preview"
              className={styles.preview}
            />
            {!readOnly && (
              <label className="btn btn-secondary cursor-pointer">
                <Upload size={16} /> Chọn ảnh
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarChange}
                />
              </label>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.col}>
            <div className={styles.formGroup}>
              <label>Họ (Last Name)</label>
              <input
                type="text"
                name="lastName"
                defaultValue={member?.lastName || ""}
                required
                placeholder="Nguyễn"
                disabled={readOnly}
              />
            </div>
          </div>
          <div className={styles.col}>
            <div className={styles.formGroup}>
              <label>Tên (First Name)</label>
              <input
                type="text"
                name="firstName"
                defaultValue={member?.firstName || ""}
                required
                placeholder="Văn A"
                disabled={readOnly}
              />
            </div>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.col}>
            <div className={styles.formGroup}>
              <label>Giới tính</label>
              <select
                name="gender"
                defaultValue={member?.gender || defaultValues?.gender || "male"}
                disabled={readOnly}
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>
          </div>
          <div className={styles.col}>
            <div className={styles.formGroup}>
              <label>Nghề nghiệp / Vai vế</label>
              <input
                type="text"
                name="occupation"
                defaultValue={member?.occupation || ""}
                placeholder="Giáo viên, Trưởng họ..."
                disabled={readOnly}
              />
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Tiểu sử (Bio)</label>
          <textarea
            name="bio"
            defaultValue={member?.bio || ""}
            disabled={readOnly}
          ></textarea>
        </div>

        <div className={styles.row}>
          <div className={styles.col}>
            <div className={styles.formGroup}>
              <label>Ngày sinh</label>
              <input
                type="date"
                name="birthDate"
                defaultValue={
                  member?.birthDate
                    ? new Date(member.birthDate).toISOString().split("T")[0]
                    : ""
                }
                disabled={readOnly}
              />
            </div>
          </div>
          <div className={styles.col}>
            <div className={styles.formGroup}>
              <label>Ngày mất (nếu có)</label>
              <input
                type="date"
                name="deathDate"
                defaultValue={
                  member?.deathDate
                    ? new Date(member.deathDate).toISOString().split("T")[0]
                    : ""
                }
                disabled={readOnly}
              />
            </div>
          </div>
        </div>

        {/* Lineage Selection */}
        <div className={styles.formGroup}>
          <label>Dòng Họ (Lineage)</label>
          <select
            name="lineageId"
            defaultValue={member?.lineageId || defaultValues?.lineageId || ""}
            disabled={readOnly}
          >
            <option value="">-- Không chọn --</option>
            {lineages?.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Relations Selectors if not pre-filled */}
        {!defaultValues?.fatherId && !defaultValues?.motherId && (
          <div className={styles.row}>
            <div className={styles.col}>
              <div className={styles.formGroup}>
                <label>Cha</label>
                <select
                  name="fatherId"
                  defaultValue={member?.fatherId || ""}
                  disabled={readOnly}
                >
                  <option value="">-- Không chọn --</option>
                  {members
                    .filter((m) => m.gender === "male" && m.id !== member?.id)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.lastName} {m.firstName}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className={styles.col}>
              <div className={styles.formGroup}>
                <label>Mẹ</label>
                <select
                  name="motherId"
                  defaultValue={member?.motherId || ""}
                  disabled={readOnly}
                >
                  <option value="">-- Không chọn --</option>
                  {members
                    .filter((m) => m.gender === "female" && m.id !== member?.id)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.lastName} {m.firstName}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {!readOnly && (
          <div className={styles.actions}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Hủy
            </button>
            <SubmitButton />
          </div>
        )}
      </form>
    </div>
  );
};

export default MemberForm;
