"use client";

import React, { useState } from "react";
import { login } from "@/actions/auth";
import { useFormStatus } from "react-dom";
import { Lock } from "lucide-react";

import styles from "./LoginModal.module.scss";

interface LoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.submitBtn} disabled={pending}>
      {pending ? "Đang kiểm tra..." : "Đăng nhập"}
    </button>
  );
};

const LoginModal = ({ onClose, onSuccess }: LoginModalProps) => {
  const [error, setError] = useState("");

  const handleLogin = async (formData: FormData) => {
    const res = await login(formData);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || "Lỗi đăng nhập");
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <Lock size={24} />
          <h2>Nhập mật khẩu quản trị</h2>
        </div>

        <form action={handleLogin}>
          <input
            type="password"
            name="pin"
            placeholder="Mật khẩu chung..."
            className={styles.input}
            autoFocus
          />
          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
            >
              Hủy
            </button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
