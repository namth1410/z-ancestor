"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./PasswordModal.module.scss";
import { Lock, ArrowRight } from "lucide-react";
import { verifyPin } from "@/actions/auth";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PasswordModal = ({ isOpen, onClose, onSuccess }: PasswordModalProps) => {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus input after animation
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Server check logic here or passed in?
    // We can use verifyPin directly
    const isValid = await verifyPin(pin);

    if (isValid) {
      onSuccess();
      onClose();
    } else {
      setError(true);
      setPin("");
      inputRef.current?.focus();
    }
    setIsLoading(false);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrapper}>
          <Lock size={24} />
        </div>

        <h3 className={styles.title}>Quyền Quản Trị</h3>
        <p className={styles.subtitle}>
          Vui lòng nhập mã PIN để mở khóa chỉnh sửa.
        </p>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <input
            ref={inputRef}
            type="password"
            className={styles.input}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError(false);
            }}
            placeholder="******"
            maxLength={6}
            style={{ borderColor: error ? "#ef4444" : undefined }}
          />

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={isLoading || pin.length === 0}
            >
              {isLoading ? (
                "Đang kt..."
              ) : (
                <>
                  Mở khóa <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
