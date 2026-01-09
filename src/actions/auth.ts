"use server";

import { cookies } from "next/headers";

const ADMIN_PIN = process.env.ADMIN_PIN || "123456";

export async function login(formData: FormData) {
  const pin = formData.get("pin") as string;

  if (pin === ADMIN_PIN) {
    (await cookies()).set("auth_pin", pin, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return { success: true };
  }

  return { success: false, error: "Mật khẩu không đúng" };
}

export async function verifyPin(pin: string) {
  return pin === ADMIN_PIN;
}

export async function logout() {
  (await cookies()).delete("auth_pin");
}

export async function isAuthenticated() {
  const pin = (await cookies()).get("auth_pin")?.value;
  return pin === ADMIN_PIN;
}
