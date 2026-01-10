"use server";

import { findRelationship } from "@/lib/relationship";

export async function calculateRelationship(
  sourceId: string,
  targetId: string
) {
  try {
    const result = await findRelationship(sourceId, targetId);
    return { success: true, data: result };
  } catch (error) {
    console.error("Relationship calculation error:", error);
    return { success: false, error: "Failed to calculate relationship" };
  }
}
