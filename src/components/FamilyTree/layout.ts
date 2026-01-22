import { Member } from "@prisma/client";
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
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const visibleMembersMap = new Map<string, Member>();

  // Helper: Get couple ID
  const getCoupleKey = (id1: string, id2: string) => {
    return [id1, id2].sort().join("-");
  };

  // --- 1. Identify Visible Members (Handling Filtering) ---
  const childrenMap = new Map<string, Member[]>();

  // Build children list
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
      // 2. By Birth Order
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

  // Apply sorting
  for (const [pid, list] of childrenMap.entries()) {
    childrenMap.set(pid, sortChildren(list));
  }

  // Calculate hidden IDs
  const hiddenIds = new Set<string>();
  const hideDescendants = (parentId: string) => {
    const children = childrenMap.get(parentId) || [];
    children.forEach((child) => {
      if (hiddenIds.has(child.id)) return;
      hiddenIds.add(child.id);
      if (child.spouseId) hiddenIds.add(child.spouseId);
      hideDescendants(child.id);
    });
  };

  const hideMarriageDescendants = (spouse1Id: string, spouse2Id: string) => {
    const c1 = childrenMap.get(spouse1Id) || [];
    const c2 = childrenMap.get(spouse2Id) || [];
    const allChildren = sortChildren([...new Set([...c1, ...c2])]);

    allChildren.forEach((child) => {
      if (hiddenIds.has(child.id)) return;
      hiddenIds.add(child.id);
      if (child.spouseId) hiddenIds.add(child.spouseId);
      hideDescendants(child.id);
    });
  };

  // Process Collapse
  members.forEach((m) => {
    if (collapsedIds.has(m.id)) hideDescendants(m.id);
    if (m.spouseId) {
      const coupleKey = getCoupleKey(m.id, m.spouseId);
      const marriageNodeId = `marriage-${coupleKey}`;
      if (collapsedIds.has(marriageNodeId)) {
        hideMarriageDescendants(m.id, m.spouseId);
      }
    }
  });

  // Filter visible
  members.forEach((m) => {
    if (!hiddenIds.has(m.id)) visibleMembersMap.set(m.id, m);
  });

  // --- 2. Build Tree Structure for Layout ---
  interface TreeNode {
    id: string; // memberId or groupKey
    type: "single" | "couple";
    members: Member[]; // 1 for single, 2 for couple
    children: TreeNode[];
    width: number; // The width of the node content itself
    subtreeWidth: number; // The full width including children
    x: number;
    y: number;
  }

  const treeNodes = new Map<string, TreeNode>();
  const processedMembers = new Set<string>();

  // Create TreeNodes
  visibleMembersMap.forEach((m) => {
    if (processedMembers.has(m.id)) return;

    const spouseId = m.spouseId;
    const spouse = spouseId ? visibleMembersMap.get(spouseId) : null;

    if (spouse) {
      // Couple
      processedMembers.add(m.id);
      processedMembers.add(spouse.id);
      const coupleKey = getCoupleKey(m.id, spouse.id);
      const id = `group-${coupleKey}`;

      // Determine Order: Male Left usually
      let m1 = m;
      let m2 = spouse;
      if (m.gender === "female" && spouse.gender === "male") {
        m1 = spouse;
        m2 = m;
      }

      treeNodes.set(id, {
        id,
        type: "couple",
        members: [m1, m2],
        children: [],
        width: NODE_WIDTH * 2 + SPOUSE_GAP,
        subtreeWidth: 0,
        x: 0,
        y: 0,
      });
    } else {
      // Single
      processedMembers.add(m.id);
      treeNodes.set(m.id, {
        id: m.id,
        type: "single",
        members: [m],
        children: [],
        width: NODE_WIDTH,
        subtreeWidth: 0,
        x: 0,
        y: 0,
      });
    }
  });

  // Build Links (Parent -> Child)
  const childToParent = new Map<string, string>(); // childNodeId -> parentNodeId

  // Helper to find which TreeNode contains a member
  const getTreeNodeId = (memberId: string): string | null => {
    if (!visibleMembersMap.has(memberId)) return null;
    const member = visibleMembersMap.get(memberId)!;
    if (member.spouseId && visibleMembersMap.has(member.spouseId)) {
      return `group-${getCoupleKey(memberId, member.spouseId)}`;
    }
    return memberId;
  };

  // Iterate all TreeNodes to find their children
  // (We iterate visible members to find relationships)
  visibleMembersMap.forEach((child) => {
    const childNodeId = getTreeNodeId(child.id);
    if (!childNodeId) return;

    // Avoid double-processing if child is part of a couple (already processed by partner?)
    // childToParent map handles uniqueness.

    const fatherId = child.fatherId;
    const motherId = child.motherId;

    let parentNodeId: string | null = null;

    // 1. Try to find a Couple Parent
    if (
      fatherId &&
      motherId &&
      visibleMembersMap.has(fatherId) &&
      visibleMembersMap.has(motherId)
    ) {
      const father = visibleMembersMap.get(fatherId)!;
      const mother = visibleMembersMap.get(motherId)!;
      if (father.spouseId === mother.id) {
        parentNodeId = `group-${getCoupleKey(fatherId, motherId)}`;
      }
    }

    // 2. If no couple, try Single Parents (Prioritize visible father, then mother)
    if (!parentNodeId) {
      if (fatherId && visibleMembersMap.has(fatherId)) {
        parentNodeId = getTreeNodeId(fatherId);
      } else if (motherId && visibleMembersMap.has(motherId)) {
        parentNodeId = getTreeNodeId(motherId);
      }
    }

    if (parentNodeId && parentNodeId !== childNodeId) {
      // Check for cycles? tree structure implies no cycles.
      // Add relation
      if (!childToParent.has(childNodeId)) {
        childToParent.set(childNodeId, parentNodeId);
        const parentNode = treeNodes.get(parentNodeId);
        const childNode = treeNodes.get(childNodeId);
        if (parentNode && childNode) {
          parentNode.children.push(childNode);
        }
      }
    }
  });

  // Identify Roots
  const roots: TreeNode[] = [];
  treeNodes.forEach((node) => {
    if (!childToParent.has(node.id)) {
      roots.push(node);
    }
  });

  // --- 3. Measure & Layout ---
  const SUBTREE_GAP = 50;
  const VERTICAL_GAP = 150;

  // Measure Subtrees
  const measure = (node: TreeNode) => {
    if (node.children.length === 0) {
      node.subtreeWidth = node.width;
      return;
    }

    let childrenTotalWidth = 0;
    // Sort children? They are added in random order of processing map.
    // Better to sort children by birthDate of the *primary* member inside them?
    node.children.sort((a, b) => {
      const mA = a.members[0]; // Primary logic
      const mB = b.members[0];
      if (mA.birthDate && mB.birthDate)
        return (
          new Date(mA.birthDate).getTime() - new Date(mB.birthDate).getTime()
        );
      return 0; // Fallback
    });

    node.children.forEach((child, i) => {
      measure(child);
      childrenTotalWidth += child.subtreeWidth;
      if (i < node.children.length - 1) childrenTotalWidth += SUBTREE_GAP;
    });

    // Subtree width is MAX(NodeWidth, ChildrenTotalWidth)
    node.subtreeWidth = Math.max(node.width, childrenTotalWidth);
  };

  roots.forEach(measure);

  // Assign Coordinates
  const layout = (node: TreeNode, x: number, y: number) => {
    // Current node X is centered in its allocated subtree space
    // x is the Left boundary of the space allocated for this node's subtree

    // 1. Position the Node itself (Centered in subtreeWidth)
    node.x = x + node.subtreeWidth / 2;
    node.y = y;

    if (node.children.length > 0) {
      // 2. Position Children
      // Calculate where the children block starts relative to x
      // It should be centered under the subtreeWidth

      const childrenBlockWidth =
        node.children.reduce((acc, c) => acc + c.subtreeWidth, 0) +
        (node.children.length - 1) * SUBTREE_GAP;

      let currentChildX = x + (node.subtreeWidth - childrenBlockWidth) / 2;

      node.children.forEach((child) => {
        layout(child, currentChildX, y + VERTICAL_GAP);
        currentChildX += child.subtreeWidth + SUBTREE_GAP;
      });
    }
  };

  let currentRootX = 0;
  roots.forEach((root) => {
    layout(root, currentRootX, 0);
    currentRootX += root.subtreeWidth + 100; // Gap between disjoint trees
  });

  // --- 4. Generate ReactFlow Nodes & Edges ---
  treeNodes.forEach((node) => {
    // NODE GENERATION
    if (node.type === "single") {
      const m = node.members[0];
      nodes.push({
        id: m.id,
        type: "custom",
        data: { member: m, isCollapsed: collapsedIds.has(m.id) },
        position: { x: node.x - NODE_WIDTH / 2, y: node.y },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });
    } else {
      // Couple
      const m1 = node.members[0]; // Left
      const m2 = node.members[1]; // Right

      // Node.x is center of the group (width = NODE_WIDTH*2 + SPOUSE_GAP)
      // Left Node Center: Node.x - (SPOUSE_GAP/2 + NODE_WIDTH/2)
      // Right Node Center: Node.x + (SPOUSE_GAP/2 + NODE_WIDTH/2)

      const offset = NODE_WIDTH / 2 + SPOUSE_GAP / 2;

      nodes.push({
        id: m1.id,
        type: "custom",
        data: { member: m1, isCollapsed: collapsedIds.has(m1.id) },
        position: { x: node.x - offset - NODE_WIDTH / 2, y: node.y }, // ReactFlow pos is TopLeft
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });

      nodes.push({
        id: m2.id,
        type: "custom",
        data: { member: m2, isCollapsed: collapsedIds.has(m2.id) },
        position: { x: node.x + offset - NODE_WIDTH / 2, y: node.y },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });

      // Marriage Node
      const coupleKey = getCoupleKey(m1.id, m2.id);
      const marriageId = `marriage-${coupleKey}`;
      const hasChildren = node.children.length > 0;
      const actualSize = hasChildren ? 32 : 10;

      nodes.push({
        id: marriageId,
        type: "marriage",
        data: {
          marriageId,
          isCollapsed: collapsedIds.has(marriageId),
          hasChildren,
        },
        position: {
          x: node.x - actualSize / 2,
          y: node.y + NODE_HEIGHT / 2 + 30 - actualSize / 2,
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });

      // Edges to Marriage
      edges.push({
        id: `e-${m1.id}-${marriageId}`,
        source: m1.id,
        target: marriageId,
        targetHandle: "target-left",
        type: "smoothstep",
        style: { stroke: "#57534e", strokeWidth: 1.5 },
      });
      edges.push({
        id: `e-${m2.id}-${marriageId}`,
        source: m2.id,
        target: marriageId,
        targetHandle: "target-right",
        type: "smoothstep",
        style: { stroke: "#57534e", strokeWidth: 1.5 },
      });
    }
  });

  // EDGE GENERATION (Parent -> Child)
  treeNodes.forEach((node) => {
    node.children.forEach((child) => {
      // Identify which member of 'child' node is the actual descendant.
      // We can check parents.
      let realChildId = child.members[0].id;
      const pIds = node.members.map((m) => m.id);
      const cMembers = child.members;
      const actualDescendant = cMembers.find(
        (m) => pIds.includes(m.fatherId!) || pIds.includes(m.motherId!),
      );
      if (actualDescendant) realChildId = actualDescendant.id;

      // Source
      let sourceId = node.members[0].id;
      if (node.type === "couple") {
        const coupleKey = getCoupleKey(node.members[0].id, node.members[1].id);
        sourceId = `marriage-${coupleKey}`;
      }

      edges.push({
        id: `e-${sourceId}-${realChildId}`,
        source: sourceId,
        target: realChildId,
        type: "smoothstep",
        style: { stroke: "#57534e", strokeWidth: 1.5 },
      });
    });
  });

  return { nodes, edges };
};
