import { Member } from "@prisma/client";
import dagre from "dagre";
import { Node, Edge, Position } from "reactflow";

const NODE_WIDTH = 250;
const NODE_HEIGHT = 100;

const SPOUSE_GAP = 50;

// Local type to handle potential schema/client sync issues
type MemberWithOrder = Member & { birthOrder?: number | null };

export const getLayoutedElements = (
  members: Member[],
  collapsedIds: Set<string>,
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Define graph direction (Top-to-Bottom) and spacing
  dagreGraph.setGraph({ rankdir: "TB", nodesep: 100, ranksep: 100 });

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const visibleMembersMap = new Map<string, Member>();

  // Helper: Get couple ID
  const getCoupleKey = (id1: string, id2: string) => {
    return [id1, id2].sort().join("-");
  };

  // --- 1. Identify Visible Members (Handling Filtering) ---
  const childrenMap = new Map<string, Member[]>();

  // Build children list and Sort siblings
  members.forEach((m) => {
    const parentIds = [m.fatherId, m.motherId].filter(Boolean) as string[];
    parentIds.forEach((pid) => {
      const list = childrenMap.get(pid) || [];
      list.push(m);
      childrenMap.set(pid, list);
    });
  });

  // Sort children function
  const sortChildren = (children: Member[]) => {
    return children.sort((a, b) => {
      // 1. By Birth Date
      if (a.birthDate && b.birthDate) {
        return (
          new Date(a.birthDate).getTime() - new Date(b.birthDate).getTime()
        );
      }
      // 2. By Birth Order (if no date)
      const orderA = (a as MemberWithOrder).birthOrder;
      const orderB = (b as MemberWithOrder).birthOrder;

      if (
        orderA !== null &&
        orderA !== undefined &&
        orderB !== null &&
        orderB !== undefined
      ) {
        return (orderA as number) - (orderB as number);
      }
      // 3. Fallback: Name
      return (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName);
    });
  };

  // Apply sorting to all children lists
  for (const [pid, list] of childrenMap.entries()) {
    childrenMap.set(pid, sortChildren(list));
  }

  // Calculate hidden IDs based on collapsed state
  const hiddenIds = new Set<string>();
  const hideDescendants = (parentId: string) => {
    const children = childrenMap.get(parentId) || [];
    children.forEach((child) => {
      if (hiddenIds.has(child.id)) return;
      hiddenIds.add(child.id);

      // Also hide spouse
      if (child.spouseId) hiddenIds.add(child.spouseId);

      hideDescendants(child.id);
    });
  };

  const hideMarriageDescendants = (spouse1Id: string, spouse2Id: string) => {
    const c1 = childrenMap.get(spouse1Id) || [];
    const c2 = childrenMap.get(spouse2Id) || [];
    const allChildren = sortChildren([...new Set([...c1, ...c2])]); // Unique & Sorted

    allChildren.forEach((child) => {
      if (hiddenIds.has(child.id)) return;
      hiddenIds.add(child.id);
      if (child.spouseId) hiddenIds.add(child.spouseId);
      hideDescendants(child.id);
    });
  };

  // Process Collapse Logic
  members.forEach((m) => {
    // Individual collapse
    if (collapsedIds.has(m.id)) {
      hideDescendants(m.id);
    }
    // Marriage collapse
    if (m.spouseId) {
      const coupleKey = getCoupleKey(m.id, m.spouseId);
      const marriageNodeId = `marriage-${coupleKey}`;
      if (collapsedIds.has(marriageNodeId)) {
        hideMarriageDescendants(m.id, m.spouseId);
      }
    }
  });

  // Filter visible members
  members.forEach((m) => {
    if (!hiddenIds.has(m.id)) {
      visibleMembersMap.set(m.id, m);
    }
  });

  // --- 2. Group into Layout Nodes (Couples or Singles) ---
  const processedMembers = new Set<string>();
  const marriageNodes = new Map<
    string,
    { id: string; spouse1: string; spouse2: string }
  >();

  visibleMembersMap.forEach((member) => {
    if (processedMembers.has(member.id)) return;

    const spouseId = member.spouseId;
    const spouse = spouseId ? visibleMembersMap.get(spouseId) : null;

    if (spouse) {
      // Create a COUPLE GROUP
      const coupleKey = getCoupleKey(member.id, spouseId!);

      // Ensure consistency: defined mainly by the lexicographically first ID to avoid duplicates
      // But here we rely on processedSet.
      processedMembers.add(member.id);
      processedMembers.add(spouseId!);

      // Determine "Primary" for the group ID (just for dagre)
      const groupId = `group-${coupleKey}`;

      // Calculate Group Width: 2 Nodes + Gap
      const width = NODE_WIDTH * 2 + SPOUSE_GAP;

      dagreGraph.setNode(groupId, { width, height: NODE_HEIGHT });

      // Record marriage info
      const marriageNodeId = `marriage-${coupleKey}`;
      marriageNodes.set(groupId, {
        id: marriageNodeId,
        spouse1: member.id,
        spouse2: spouseId!,
      });
    } else {
      // SINGLE NODE
      processedMembers.add(member.id);
      dagreGraph.setNode(member.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    }
  });

  // --- 3. Add Edges ---
  // Iterate visible members again to connect Parent -> Child
  // We need to map "Member ID" to "Dagre Node ID" (Group or MemberID)
  const getDagreId = (memberId: string) => {
    const member = visibleMembersMap.get(memberId);
    if (!member) return null;
    if (member.spouseId && visibleMembersMap.has(member.spouseId)) {
      return `group-${getCoupleKey(member.id, member.spouseId)}`;
    }
    return member.id;
  };

  visibleMembersMap.forEach((child) => {
    const fatherId = child.fatherId;
    const motherId = child.motherId;

    let sourceDagreId: string | null = null;

    // Determine Source
    if (
      fatherId &&
      motherId &&
      visibleMembersMap.has(fatherId) &&
      visibleMembersMap.has(motherId)
    ) {
      // Both parents visible -> Source is their GROUP
      sourceDagreId = `group-${getCoupleKey(fatherId, motherId)}`;
    } else if (fatherId && visibleMembersMap.has(fatherId)) {
      sourceDagreId = getDagreId(fatherId);
    } else if (motherId && visibleMembersMap.has(motherId)) {
      sourceDagreId = getDagreId(motherId);
    }

    const targetDagreId = getDagreId(child.id);

    if (sourceDagreId && targetDagreId) {
      // Avoid self-loops (shouldn't happen in tree) and duplicate edges
      // Dagre doesn't like multi-edges between same nodes often, but here:
      // Case: Siblings have same Source Group -> Same Target Group? No, siblings are diff members.
      // If siblings are married to each other? (Sweet Home Alabama?) -> Graph cycle?

      // Add minimal edge to Dagre for ranking
      // Note: multiple edges between same nodes in Dagre is fine usually?
      // Actually, we should only add ONE edge per relationship to Dagre to establish rank.
      // But duplicate edges don't hurt much other than perf.
      dagreGraph.setEdge(sourceDagreId, targetDagreId);
    }
  });

  // --- 4. Run Layout ---
  dagre.layout(dagreGraph);

  // --- 5. Unpack Nodes and Generate Elements ---
  dagreGraph.nodes().forEach((nodeKey) => {
    const pos = dagreGraph.node(nodeKey); // Center x, y

    // Check if it is a Group
    if (nodeKey.startsWith("group-")) {
      const marriageInfo = marriageNodes.get(nodeKey)!;
      const spouse1 = visibleMembersMap.get(marriageInfo.spouse1)!;
      const spouse2 = visibleMembersMap.get(marriageInfo.spouse2)!;
      const marriageNodeId = marriageInfo.id;

      // Calculate positions relative to Group Center (pos.x, pos.y)
      // Group Width = NODE_WIDTH * 2 + SPOUSE_GAP
      //                 [ Spouse 1 ]  -  [ Spouse 2 ]
      // x coords:       -offset           +offset

      // Determine "Male" on left usually? Or arbitrary?
      // Let's put Husband (Left) and Wife (Right) if possible
      let leftSpouse = spouse1;
      let rightSpouse = spouse2;

      if (spouse1.gender === "female" && spouse2.gender === "male") {
        leftSpouse = spouse2;
        rightSpouse = spouse1;
      }

      const halfWidth = NODE_WIDTH / 2;
      const offset = halfWidth + SPOUSE_GAP / 2;

      // Position 1 (Left)
      const x1 = pos.x - offset;
      const y1 = pos.y - NODE_HEIGHT / 2;

      // Position 2 (Right)
      const x2 = pos.x + offset;
      const y2 = pos.y - NODE_HEIGHT / 2;

      // Add Spouse Nodes
      nodes.push({
        id: leftSpouse.id,
        type: "custom",
        data: {
          member: leftSpouse,
          isCollapsed: collapsedIds.has(leftSpouse.id),
        },
        position: { x: x1, y: y1 },
        sourcePosition: "bottom" as Position,
        targetPosition: "top" as Position,
      });

      nodes.push({
        id: rightSpouse.id,
        type: "custom",
        data: {
          member: rightSpouse,
          isCollapsed: collapsedIds.has(rightSpouse.id),
        },
        position: { x: x2, y: y2 },
        sourcePosition: "bottom" as Position,
        targetPosition: "top" as Position,
      });

      // Check children existence for the marriage toggle
      const c1 = childrenMap.get(leftSpouse.id) || [];
      const c2 = childrenMap.get(rightSpouse.id) || [];
      const hasChildren = c1.length > 0 || c2.length > 0;

      // Add Marriage Node (Center)
      // Position it exactly between them but lower to form a bracket
      const MARRIAGE_VERTICAL_OFFSET = 30;
      const actualSize = hasChildren ? 32 : 10;
      const mx = pos.x - actualSize / 2; // Center of group
      const my =
        pos.y + NODE_HEIGHT / 2 + MARRIAGE_VERTICAL_OFFSET - actualSize / 2;

      nodes.push({
        id: marriageNodeId,
        type: "marriage",
        data: {
          marriageId: marriageNodeId,
          isCollapsed: collapsedIds.has(marriageNodeId),
          hasChildren,
        },
        position: { x: mx, y: my },
        sourcePosition: "bottom" as Position,
        targetPosition: "top" as Position,
      });

      // Add Edges: Spouse -> Marriage
      edges.push({
        id: `e-${leftSpouse.id}-${marriageNodeId}`,
        source: leftSpouse.id,
        target: marriageNodeId,
        targetHandle: "target-left",
        type: "smoothstep",
        style: { stroke: "#57534e", strokeWidth: 1.5 },
      });
      edges.push({
        id: `e-${rightSpouse.id}-${marriageNodeId}`,
        source: rightSpouse.id,
        target: marriageNodeId,
        targetHandle: "target-right",
        type: "smoothstep",
        style: { stroke: "#57534e", strokeWidth: 1.5 },
      });
    } else {
      // Single Node
      const member = visibleMembersMap.get(nodeKey);
      if (member) {
        nodes.push({
          id: member.id,
          type: "custom",
          data: { member, isCollapsed: collapsedIds.has(member.id) },
          position: {
            x: pos.x - NODE_WIDTH / 2,
            y: pos.y - NODE_HEIGHT / 2,
          },
          sourcePosition: "bottom" as Position,
          targetPosition: "top" as Position,
        });
      }
    }
  });

  // --- 6. Generate Edges (Parent -> Child) ---
  visibleMembersMap.forEach((child) => {
    // Find parents
    const father = child.fatherId
      ? visibleMembersMap.get(child.fatherId)
      : null;
    const mother = child.motherId
      ? visibleMembersMap.get(child.motherId)
      : null;

    // Case 1: Married Parents (Both visible)
    if (father && mother && father.spouseId === mother.id) {
      const coupleKey = getCoupleKey(father.id, mother.id);
      const marriageNodeId = `marriage-${coupleKey}`;

      // Connect Marriage Node -> Child
      edges.push({
        id: `e-${marriageNodeId}-${child.id}`,
        source: marriageNodeId,
        target: child.id,
        type: "smoothstep",
        style: { stroke: "#57534e", strokeWidth: 1.5 },
      });
    }
    // Case 2: Single or Unmarried Parents
    else {
      if (father) {
        edges.push({
          id: `e-${father.id}-${child.id}`,
          source: father.id,
          target: child.id,
          type: "smoothstep",
          style: { stroke: "#57534e", strokeWidth: 1.5 },
        });
      }
      if (mother) {
        edges.push({
          id: `e-${mother.id}-${child.id}`,
          source: mother.id,
          target: child.id,
          type: "smoothstep",
          style: { stroke: "#57534e", strokeWidth: 1.5 },
        });
      }
    }
  });

  return { nodes, edges };
};
