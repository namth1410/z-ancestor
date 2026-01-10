"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getLineages() {
  try {
    const lineages = await db.lineage.findMany({
      include: {
        rootMember: true,
        _count: {
          select: { members: true },
        },
      },
      orderBy: { code: "asc" },
    });
    return { success: true, data: lineages };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to fetch lineages" };
  }
}

export async function getLineage(code: string) {
  try {
    const lineage = await db.lineage.findUnique({
      where: { code },
      include: {
        rootMember: true,
        // members: true, // Don't fetch members directly here to avoid type conflict with manual merge
      },
    });

    if (!lineage) return { success: false, error: "Lineage not found" };

    if (!lineage.rootMemberId) {
      return {
        success: true,
        data: { ...lineage, members: [] },
      };
    }

    // Recursive fetch: Start from root, find all descendants and their spouses
    const allMembers = new Map<string, any>(); // Use Map to avoid duplicates
    let currentGenerationIds = [lineage.rootMemberId];

    // Add root member first
    if (lineage.rootMember) {
      allMembers.set(lineage.rootMember.id, lineage.rootMember);
    }

    // Loop to find all generations
    while (currentGenerationIds.length > 0) {
      // 1. Find children of current generation
      const children = await db.member.findMany({
        where: {
          OR: [
            { fatherId: { in: currentGenerationIds } },
            { motherId: { in: currentGenerationIds } },
          ],
        },
      });

      // 2. Find spouses of current generation (to include in-laws)
      const currentGenMembers = await db.member.findMany({
        where: { id: { in: currentGenerationIds } },
        select: { spouseId: true },
      });

      const spouseIds = currentGenMembers
        .map((m) => m.spouseId)
        .filter((id): id is string => id !== null);

      const spouses = await db.member.findMany({
        where: { id: { in: spouseIds } },
      });

      // Add spouses to map
      spouses.forEach((s) => {
        if (!allMembers.has(s.id)) allMembers.set(s.id, s);
      });

      // Add children to map and prepare for next loop
      const nextGenIds: string[] = [];
      children.forEach((child) => {
        if (!allMembers.has(child.id)) {
          allMembers.set(child.id, child);
          nextGenIds.push(child.id);
        }
      });

      currentGenerationIds = nextGenIds;
    }

    // Convert map to array
    const members = Array.from(allMembers.values());

    return {
      success: true,
      data: {
        ...lineage,
        members: members,
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to fetch lineage" };
  }
}

export async function createLineage(prevState: unknown, formData: FormData) {
  try {
    const code = formData.get("code") as string;
    const name = formData.get("name") as string;

    await db.lineage.create({
      data: { code, name },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create lineage" };
  }
}

// Wrapper for direct API calls
export async function createLineageData(data: { code: string; name: string }) {
  try {
    await db.lineage.create({
      data: { code: data.code, name: data.name },
    });

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") {
      return { success: false, error: "Code đã tồn tại!" };
    }
    return { success: false, error: "Có lỗi xảy ra" };
  }
}

export async function updateLineage(
  id: string,
  prevState: unknown,
  formData: FormData
) {
  try {
    const name = formData.get("name") as string;
    const rootMemberId = (formData.get("rootMemberId") as string) || null;

    await db.lineage.update({
      where: { id },
      data: { name, rootMemberId },
    });

    revalidatePath("/admin");
    revalidatePath("/tree/[id]", "page");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update lineage" };
  }
}

// Wrapper for direct API calls (not form actions)
export async function updateLineageData(
  id: string,
  data: { name: string; rootMemberId: string | null }
) {
  try {
    await db.lineage.update({
      where: { id },
      data: { name: data.name, rootMemberId: data.rootMemberId },
    });

    revalidatePath("/admin");
    revalidatePath("/tree/[id]", "page");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update lineage" };
  }
}

export async function deleteLineage(id: string) {
  try {
    // First, unassign all members from this lineage
    await db.member.updateMany({
      where: { lineageId: id },
      data: { lineageId: null },
    });

    // Then delete the lineage
    await db.lineage.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/tree/[id]", "page");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete lineage" };
  }
}

export async function assignMembersToLineage(
  lineageId: string,
  memberIds: string[]
) {
  try {
    // Get all current members of this lineage
    const currentMembers = await db.member.findMany({
      where: { lineageId },
      select: { id: true },
    });
    const currentMemberIds = currentMembers.map((m) => m.id);

    // Members to remove (currently in lineage but not in new list)
    const toRemove = currentMemberIds.filter((id) => !memberIds.includes(id));

    // Members to add (in new list but not currently in lineage)
    const toAdd = memberIds.filter((id) => !currentMemberIds.includes(id));

    // Remove members
    if (toRemove.length > 0) {
      await db.member.updateMany({
        where: { id: { in: toRemove } },
        data: { lineageId: null },
      });
    }

    // Add members
    if (toAdd.length > 0) {
      await db.member.updateMany({
        where: { id: { in: toAdd } },
        data: { lineageId },
      });
    }

    revalidatePath("/admin");
    revalidatePath("/tree/[id]", "page");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to assign members" };
  }
}
