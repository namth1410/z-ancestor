import { Member } from "@prisma/client";
import { db } from "./db";

type RelationType = "FATHER" | "MOTHER" | "SPOUSE" | "CHILD";

interface PathNode {
  memberId: string;
  relationToNext?: RelationType; // Relation FROM this node TO the next node
}

interface RelationshipResult {
  sourceId: string;
  targetId: string;
  relationshipName: string; // e.g. "Chú", "Bác", "Anh họ"
  pathDescription: string[]; // e.g. ["Bố", "Em trai"]
}

// Helper to get relative name based on path
// This is a SIMPLIFIED version. Complex logic needs detailed rules.
function inferRelationship(
  path: { member: Member; relationToPrev: RelationType }[],
  target: Member
): string {
  // path[0] is source. path[last] is target.
  const steps = path.slice(1); // Remove source
  if (steps.length === 0) return "Bản thân";

  const lastStep = steps[steps.length - 1];
  const lastRelation = lastStep.relationToPrev;

  const targetGender = target.gender?.toLowerCase() || "";
  const isMale = targetGender === "male" || targetGender === "nam";

  // 1. Direct Parent / Child / Spouse
  if (steps.length === 1) {
    if (lastRelation === "FATHER") return "Bố";
    if (lastRelation === "MOTHER") return "Mẹ";
    if (lastRelation === "CHILD") return isMale ? "Con trai" : "Con gái";
    if (lastRelation === "SPOUSE") return isMale ? "Chồng" : "Vợ";
  }

  // 2. Generation Gap = 2 or Horizontal
  if (steps.length === 2) {
    const step1 = steps[0];
    const step2 = steps[1];
    const r1 = step1.relationToPrev;
    const r2 = step2.relationToPrev;

    // Grandparents: Source -> Father/Mother -> Father/Mother
    if (
      (r1 === "FATHER" || r1 === "MOTHER") &&
      (r2 === "FATHER" || r2 === "MOTHER")
    ) {
      const isOng = r2 === "FATHER"; // Target is Father of Parent
      if (r1 === "FATHER") return isOng ? "Ông Nội" : "Bà Nội";
      if (r1 === "MOTHER") return isOng ? "Ông Ngoại" : "Bà Ngoại";
    }

    // Grandchildren: Source -> Child -> Child
    if (r1 === "CHILD" && r2 === "CHILD") {
      // Child 1 is Son -> Nội, Daughter -> Ngoại
      const child1Gender = step1.member.gender?.toLowerCase() || "";
      const isNoi = child1Gender === "male" || child1Gender === "nam";

      let prefix = "Cháu";
      if (isNoi) prefix += " nội";
      else prefix += " ngoại";

      return isMale ? `${prefix} (trai)` : `${prefix} (gái)`;
    }

    // Siblings: Source -> Father/Mother -> Child
    if ((r1 === "FATHER" || r1 === "MOTHER") && r2 === "CHILD") {
      const source = path[0].member;
      const sDate = source.birthDate ? new Date(source.birthDate) : null;
      const tDate = target.birthDate ? new Date(target.birthDate) : null;

      let isOlder = false;
      // If dates available, compare. Else fallback?
      if (sDate && tDate) {
        isOlder = tDate < sDate; // Target born BEFORE Source -> Older
      }

      if (isMale) return isOlder ? "Anh trai" : "Em trai";
      return isOlder ? "Chị gái" : "Em gái";
    }

    // --- In-laws ---

    // Parents-in-law: Source -> Spouse -> Father/Mother
    if (r1 === "SPOUSE" && (r2 === "FATHER" || r2 === "MOTHER")) {
      const sourceGender = path[0].member.gender?.toLowerCase() || "";
      const isSourceMale = sourceGender === "male" || sourceGender === "nam";

      if (r2 === "FATHER")
        return isSourceMale ? "Bố vợ (Nhạc phụ)" : "Bố chồng";
      if (r2 === "MOTHER")
        return isSourceMale ? "Mẹ vợ (Nhạc mẫu)" : "Mẹ chồng";
    }

    // Children-in-law: Source -> Child -> Spouse
    if (r1 === "CHILD" && r2 === "SPOUSE") {
      if (isMale) return "Con rể";
      return "Con dâu";
    }
  }

  // 3. Generation Gap = 3
  if (steps.length === 3) {
    const step1 = steps[0];
    const step2 = steps[1];
    const step3 = steps[2];
    const r1 = step1.relationToPrev;
    const r2 = step2.relationToPrev;
    const r3 = step3.relationToPrev;

    // Case 3.1: Great Grandparents (Cụ) - UP UP UP
    const isUp =
      (r1 === "FATHER" || r1 === "MOTHER") &&
      (r2 === "FATHER" || r2 === "MOTHER") &&
      (r3 === "FATHER" || r3 === "MOTHER");

    if (isUp) {
      const side = r1 === "FATHER" ? "Nội" : "Ngoại";
      return isMale ? `Cụ Ông (${side})` : `Cụ Bà (${side})`;
    }

    // Case 3.2: Great Grandchildren (Chắt) - DOWN DOWN DOWN
    const isDown = r1 === "CHILD" && r2 === "CHILD" && r3 === "CHILD";
    if (isDown) {
      return isMale ? "Chắt trai" : "Chắt gái";
    }

    // Case 3.3: Uncle/Aunt (Chú/Bác/Cô/Cậu/Dì) - UP UP DOWN
    // Source -> Parent -> GrandParent -> Uncle/Aunt
    const isMixUpDown =
      (r1 === "FATHER" || r1 === "MOTHER") &&
      (r2 === "FATHER" || r2 === "MOTHER") &&
      r3 === "CHILD";
    if (isMixUpDown) {
      // Parent is step1.member
      // Uncle/Aunt is target (step3.member) (passed as argument 'target')

      const parent = step1.member;
      const pDate = parent.birthDate ? new Date(parent.birthDate) : null;
      const tDate = target.birthDate ? new Date(target.birthDate) : null;

      let isOlder = false;
      // Logic: Target born BEFORE Parent -> Older -> Bác
      if (pDate && tDate) isOlder = tDate < pDate;

      if (r1 === "FATHER") {
        // Bên Nội: Anh/Chị của Bố là Bác. Em trai bố là Chú. Em gái bố là Cô.
        if (isOlder) return isMale ? "Bác trai" : "Bác gái";
        return isMale ? "Chú" : "Cô";
      } else {
        // Bên Ngoại: Anh/Chị của mẹ. Miền Bắc gọi là Bác. Em trai mẹ là Cậu. Em gái mẹ là Dì.
        if (isOlder) return isMale ? "Bác trai" : "Bác gái";
        return isMale ? "Cậu" : "Dì";
      }
    }

    // Case 3.4: Nephew/Niece (Cháu - con của anh/chị/em) - UP DOWN DOWN
    // Source -> GrandParent -> Sibling -> Cháu
    // Wait: Source -> GP is Up Up? No.
    // Sibling relation logic in Steps=2 is Source -> Parent -> Child (Target=Sibling).
    // Nephew: Source -> Parent -> Sibling -> Child (Nephew).
    // Path: [Source, Parent, Sibling, Nephew]. Steps = 3.
    // r1=UP, r2=CHILD (Sibling), r3=CHILD (Nephew).
    if (
      (r1 === "FATHER" || r1 === "MOTHER") &&
      r2 === "CHILD" &&
      r3 === "CHILD"
    ) {
      return isMale ? "Cháu trai" : "Cháu gái";
    }
  }

  // 4. Generation Gap = 4 (In-laws of Uncle/Aunt OR Cousins)
  if (steps.length === 4) {
    const step1 = steps[0];
    const step2 = steps[1];
    const step3 = steps[2];
    const step4 = steps[3];
    const r1 = step1.relationToPrev;
    const r2 = step2.relationToPrev;
    const r3 = step3.relationToPrev;
    const r4 = step4.relationToPrev;

    // Case 4.1 In-laws of Uncle/Aunt (Thím/Mợ/Dượng)
    // Path: Source -> P -> GP -> U -> Spouse (Thím/Mợ...)
    if (
      (r1 === "FATHER" || r1 === "MOTHER") &&
      (r2 === "FATHER" || r2 === "MOTHER") &&
      r3 === "CHILD" &&
      r4 === "SPOUSE"
    ) {
      // Determine what Step3 (Uncle/Aunt) is called
      const parent = step1.member;
      const uncleAunt = step3.member;
      const pDate = parent.birthDate ? new Date(parent.birthDate) : null;
      const uDate = uncleAunt.birthDate ? new Date(uncleAunt.birthDate) : null;
      let isOlder = false;
      if (pDate && uDate) isOlder = uDate < pDate;

      const isInternalMale =
        uncleAunt.gender?.toLowerCase() === "male" ||
        uncleAunt.gender?.toLowerCase() === "nam";
      const isTargetMale = isMale; // The spouse gender

      // Logic mapping:
      if (r1 === "FATHER") {
        // Nội
        if (isOlder) {
          return isTargetMale ? "Bác rể (Dượng)" : "Bác dâu";
        }
        // Younger
        if (isInternalMale) return "Thím"; // Chú -> Thím
        return "Dượng"; // Cô -> Dượng
      } else {
        // Ngoại
        if (isOlder) {
          return isTargetMale ? "Bác rể (Dượng)" : "Mợ (Bác dâu)";
        }
        // Younger
        if (isInternalMale) return "Mợ"; // Cậu -> Mợ
        return "Dượng"; // Dì -> Dượng
      }
    }

    // Case 4.2: Cousins (Anh em họ) - UP UP DOWN DOWN
    // Path: Source -> Parent -> GP -> Uncle/Aunt -> Cousin (Target)
    if (
      (r1 === "FATHER" || r1 === "MOTHER") &&
      (r2 === "FATHER" || r2 === "MOTHER") &&
      r3 === "CHILD" &&
      r4 === "CHILD"
    ) {
      const parentA = step1.member;
      const parentTarget = step3.member;

      const pADate = parentA.birthDate ? new Date(parentA.birthDate) : null;
      const pTDate = parentTarget.birthDate
        ? new Date(parentTarget.birthDate)
        : null;

      // Logic: "Con chú con bác", "Con chị con em"
      // So sánh tuổi của Cha/Mẹ hai bên.
      // Ai là con của người "lớn hơn" thì làm Anh/Chị.
      // (Luật phổ biến: Con Bác > Con Chú. Con Anh > Con Em).

      let parentAIsOlder = false;
      if (pADate && pTDate) {
        parentAIsOlder = pADate < pTDate; // Date nhỏ hơn là sinh trước -> Older
      }

      // Nếu Cha/Mẹ A lớn hơn Cha/Mẹ Target -> A làm Anh/Chị.
      // A gọi Target là "Em họ".
      if (parentAIsOlder) {
        return isMale ? "Em họ (trai)" : "Em họ (gái)";
      } else {
        // A làm Em. A gọi Target là Anh/Chị họ.
        return isMale ? "Anh họ" : "Chị họ";
      }
    }
  }

  // 5. Generation Gap = 5 (Spouse of Cousin)
  if (steps.length === 5) {
    // Path: Source -> Parent -> GP -> Uncle/Aunt -> Cousin -> Spouse
    // Pattern: UP -> UP -> DOWN -> DOWN -> SPOUSE
    const step1 = steps[0];
    const step2 = steps[1];
    const step3 = steps[2];
    const step4 = steps[3];
    const step5 = steps[4];

    const r1 = step1.relationToPrev;
    const r2 = step2.relationToPrev;
    const r3 = step3.relationToPrev;
    const r4 = step4.relationToPrev;
    const r5 = step5.relationToPrev;

    if (
      (r1 === "FATHER" || r1 === "MOTHER") &&
      (r2 === "FATHER" || r2 === "MOTHER") &&
      r3 === "CHILD" &&
      r4 === "CHILD" &&
      r5 === "SPOUSE"
    ) {
      const parentA = step1.member;
      const parentCousin = step3.member;
      const cousin = step4.member; // The cousin

      const pADate = parentA.birthDate ? new Date(parentA.birthDate) : null;
      const pCDate = parentCousin.birthDate
        ? new Date(parentCousin.birthDate)
        : null;

      // 1. Determine Cousin Relation (Anh/Chị vs Em)
      let aIsOlderVaiVe = false;
      if (pADate && pCDate) aIsOlderVaiVe = pADate < pCDate; // Parent A older -> A is Anh/Chi

      const isTargetMale = isMale; // Spouse gender (Target)

      if (aIsOlderVaiVe) {
        // A is Anh/Chi. Cousin is Em.
        // Target is Spouse of Em.
        return isTargetMale ? "Em rể (họ)" : "Em dâu (họ)";
      } else {
        // A is Em. Cousin is Anh/Chi.
        // Target is Spouse of Anh/Chi.
        if (
          cousin.gender?.toLowerCase() === "male" ||
          cousin.gender?.toLowerCase() === "nam"
        ) {
          // Cousin is Anh trai. Target is Vo -> Chi dau.
          return "Chị dâu (họ)";
        } else {
          // Cousin is Chi gai. Target is Chong -> Anh re.
          return "Anh rể (họ)";
        }
      }
    }

    // Case 5.2: Child of Cousin (Cháu họ) - UP UP DOWN DOWN DOWN
    // Path: Source -> Parent -> GP -> Uncle/Aunt -> Cousin -> Child
    if (
      (r1 === "FATHER" || r1 === "MOTHER") &&
      (r2 === "FATHER" || r2 === "MOTHER") &&
      r3 === "CHILD" &&
      r4 === "CHILD" &&
      r5 === "CHILD"
    ) {
      // Source is Cousin of Target's Parent.
      // Source is likely Bác/Chú/Cô/Dì/Cậu họ.
      // Target is Cháu họ.
      return isMale ? "Cháu trai (họ)" : "Cháu gái (họ)";
    }
  }

  return "Họ hàng xa / Chưa rõ";
}

export async function findRelationship(
  sourceId: string,
  targetId: string
): Promise<RelationshipResult | null> {
  // 1. Load all members to build graph in memory (efficient for < 5000 members)
  const members = await db.member.findMany({
    include: {
      father: true,
      mother: true,
      spouse: true,
      children: true, // Father relation
      mchildren: true, // Mother relation
      spouses: true, // Reverse spouse relation
    },
  });

  // Explicit type cast if needed or let inference work
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const source = memberMap.get(sourceId);
  const target = memberMap.get(targetId);

  if (!source || !target) return null;

  // 2. BFS
  // Use explicit typing for queue items to avoid implicit any
  interface QueueItem {
    id: string;
    path: { memberId: string; relationToPrev: RelationType }[];
  }
  const queue: QueueItem[] = [];
  const visited = new Set<string>();

  queue.push({
    id: sourceId,
    path: [{ memberId: sourceId, relationToPrev: "FATHER" as RelationType }],
  });
  visited.add(sourceId);

  while (queue.length > 0) {
    const { id, path } = queue.shift()!;

    if (id === targetId) {
      // Found!
      const fullPath = path.map((p) => ({
        member: memberMap.get(p.memberId)!,
        relationToPrev: p.relationToPrev,
      }));

      const name = inferRelationship(fullPath, target);
      return {
        sourceId,
        targetId,
        relationshipName: name,
        pathDescription: fullPath
          .slice(1)
          .map((p) => p.member.lastName + " " + p.member.firstName),
      };
    }

    const currentMember = memberMap.get(id)!;

    // Explore Neighbors

    // Parents
    if (currentMember.fatherId && !visited.has(currentMember.fatherId)) {
      visited.add(currentMember.fatherId);
      queue.push({
        id: currentMember.fatherId,
        path: [
          ...path,
          { memberId: currentMember.fatherId, relationToPrev: "FATHER" },
        ],
      });
    }
    if (currentMember.motherId && !visited.has(currentMember.motherId)) {
      visited.add(currentMember.motherId);
      queue.push({
        id: currentMember.motherId,
        path: [
          ...path,
          { memberId: currentMember.motherId, relationToPrev: "MOTHER" },
        ],
      });
    }

    // Children (Check both relations)
    const combinedChildren = [
      ...(currentMember.children || []),
      ...(currentMember.mchildren || []),
    ];
    for (const child of combinedChildren) {
      if (!visited.has(child.id)) {
        visited.add(child.id);
        queue.push({
          id: child.id,
          path: [...path, { memberId: child.id, relationToPrev: "CHILD" }],
        });
      }
    }

    // Spouse (Check both directions)
    if (currentMember.spouseId && !visited.has(currentMember.spouseId)) {
      visited.add(currentMember.spouseId);
      queue.push({
        id: currentMember.spouseId,
        path: [
          ...path,
          { memberId: currentMember.spouseId, relationToPrev: "SPOUSE" },
        ],
      });
    }
    // Reverse Spouses
    if (currentMember.spouses) {
      for (const sp of currentMember.spouses) {
        if (!visited.has(sp.id)) {
          visited.add(sp.id);
          queue.push({
            id: sp.id,
            path: [...path, { memberId: sp.id, relationToPrev: "SPOUSE" }],
          });
        }
      }
    }
  }

  return {
    sourceId,
    targetId,
    relationshipName: "Không tìm thấy quan hệ (hoặc quá xa)",
    pathDescription: [],
  };
}
