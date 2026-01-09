"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import { join } from "path";

// AUTH REMOVED AS REQUESTED

export async function getMembers() {
  try {
    const members = await db.member.findMany({
      orderBy: { createdAt: "asc" },
    });
    return { success: true, data: members };
  } catch {
    return { success: false, error: "Failed to fetch members" };
  }
}

async function handleFileUpload(file: File): Promise<string | undefined> {
  if (!file || file.size === 0) return undefined;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename
  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(7)}.${ext}`;
  const uploadDir = join(process.cwd(), "public", "uploads");
  const filepath = join(uploadDir, filename);

  // Ensure directory exists - expecting 'public/uploads' to exist or creating it (requires fs check, skipping for brevity, assuming standard setup)
  // Simple write
  await writeFile(filepath, buffer);

  return `/uploads/${filename}`;
}

export async function createMember(prevState: unknown, formData: FormData) {
  try {
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      gender: formData.get("gender") as string,
      bio: formData.get("bio") as string,
      occupation: formData.get("occupation") as string,
      address: formData.get("address") as string,
      birthPlace: formData.get("birthPlace") as string,
      // Handle relations later or in update
      fatherId: (formData.get("fatherId") as string) || null,
      motherId: (formData.get("motherId") as string) || null,
      spouseId: (formData.get("spouseId") as string) || null,
    };

    const avatarFile = formData.get("avatar") as File;
    let avatarUrl = undefined;
    if (avatarFile) {
      avatarUrl = await handleFileUpload(avatarFile);
    }

    const birthDateStr = formData.get("birthDate") as string;
    const deathDateStr = formData.get("deathDate") as string;

    await db.member.create({
      data: {
        ...data,
        birthDate: birthDateStr ? new Date(birthDateStr) : null,
        deathDate: deathDateStr ? new Date(deathDateStr) : null,
        avatar: avatarUrl,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create member" };
  }
}

export async function updateMember(
  id: string,
  prevState: unknown,
  formData: FormData
) {
  try {
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      gender: formData.get("gender") as string,
      bio: formData.get("bio") as string,
      occupation: formData.get("occupation") as string,
      address: formData.get("address") as string,
      birthPlace: formData.get("birthPlace") as string,
      fatherId: (formData.get("fatherId") as string) || null,
      motherId: (formData.get("motherId") as string) || null,
      spouseId: (formData.get("spouseId") as string) || null,
    };

    const avatarFile = formData.get("avatar") as File;
    let avatarUrl = undefined;
    if (avatarFile && avatarFile.size > 0) {
      avatarUrl = await handleFileUpload(avatarFile);
    }

    const birthDateStr = formData.get("birthDate") as string;
    const deathDateStr = formData.get("deathDate") as string;

    await db.member.update({
      where: { id },
      data: {
        ...data,
        birthDate: birthDateStr ? new Date(birthDateStr) : null,
        deathDate: deathDateStr ? new Date(deathDateStr) : null,
        ...(avatarUrl && { avatar: avatarUrl }),
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update member" };
  }
}

export async function deleteMember(id: string) {
  try {
    await db.member.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete member" };
  }
}
