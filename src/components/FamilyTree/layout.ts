import { Member } from "@prisma/client";
import dagre from "dagre";
import { Node, Edge, Position } from "reactflow";

const NODE_WIDTH = 250;
const NODE_HEIGHT = 100;
const MARRIAGE_NODE_SIZE = 10;

export const getLayoutedElements = (
  members: Member[],
  collapsedIds: Set<string>
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Increase ranksep to allow space for the vertical drop
  dagreGraph.setGraph({ rankdir: "TB", nodesep: 50, ranksep: 80 });

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // const memberMap = new Map(members.map((m) => [m.id, m]));
  const childrenMap = new Map<string, string[]>();

  // Build children map logic (same as before)
  members.forEach((m) => {
    if (m.fatherId) {
      const list = childrenMap.get(m.fatherId) || [];
      list.push(m.id);
      childrenMap.set(m.fatherId, list);
    }
    if (m.motherId) {
      const list = childrenMap.get(m.motherId) || [];
      list.push(m.id);
      childrenMap.set(m.motherId, list);
    }
  });

  // Create a map to look up spouses quickly
  const memberMap = new Map(members.map((m) => [m.id, m]));

  const hiddenIds = new Set<string>();

  const hideDescendants = (parentId: string) => {
    // Hide the children
    const children = childrenMap.get(parentId) || [];
    children.forEach((childId) => {
      // If child is already hidden, prevent infinite loop (though tree should be acyclic)
      if (hiddenIds.has(childId)) return;

      hiddenIds.add(childId);

      // Also hide spouse of the child (in-law)
      const child = memberMap.get(childId);
      if (child && child.spouseId) {
        hiddenIds.add(child.spouseId);
      }

      // Recursively hide grandchildren
      hideDescendants(childId);
    });
  };

  // Hide descendants of a marriage (both parents)
  const hideMarriageDescendants = (spouse1Id: string, spouse2Id: string) => {
    const children1 = childrenMap.get(spouse1Id) || [];
    const children2 = childrenMap.get(spouse2Id) || [];
    // Get union of children from both parents
    const allChildren = new Set([...children1, ...children2]);
    allChildren.forEach((childId) => {
      if (hiddenIds.has(childId)) return;

      hiddenIds.add(childId);

      // Also hide spouse of the child
      const child = memberMap.get(childId);
      if (child && child.spouseId) {
        hiddenIds.add(child.spouseId);
      }

      hideDescendants(childId);
    });
  };

  // Helper to generate couple key (moved up for early use)
  const getCoupleKey = (id1: string, id2: string) => {
    return [id1, id2].sort().join("-");
  };

  // Check for individual member collapse
  members.forEach((m) => {
    if (collapsedIds.has(m.id)) {
      hideDescendants(m.id);
    }
  });

  // Check for marriage node collapse BEFORE filtering visible members
  members.forEach((member) => {
    if (member.spouseId) {
      const coupleKey = getCoupleKey(member.id, member.spouseId);
      const marriageNodeId = `marriage-${coupleKey}`;
      if (collapsedIds.has(marriageNodeId)) {
        hideMarriageDescendants(member.id, member.spouseId);
      }
    }
  });

  const visibleMembers = members.filter((m) => !hiddenIds.has(m.id));
  const visibleMemberIds = new Set(visibleMembers.map((m) => m.id));

  // Track created marriage nodes to avoid duplicates
  const marriageNodes = new Map<
    string,
    { id: string; spouse1: string; spouse2: string }
  >();

  // 1. Add Member Nodes
  visibleMembers.forEach((member) => {
    dagreGraph.setNode(member.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    nodes.push({
      id: member.id,
      type: "custom", // Uses CustomNode
      data: {
        member,
        isCollapsed: collapsedIds.has(member.id),
        hasChildren: (childrenMap.get(member.id)?.length || 0) > 0,
      },
      position: { x: 0, y: 0 },
    });
  });

  // 2. Identify Couples and Create Marriage Nodes
  visibleMembers.forEach((member) => {
    if (member.spouseId && visibleMemberIds.has(member.spouseId)) {
      const coupleKey = getCoupleKey(member.id, member.spouseId);
      if (!marriageNodes.has(coupleKey)) {
        const marriageNodeId = `marriage-${coupleKey}`;
        marriageNodes.set(coupleKey, {
          id: marriageNodeId,
          spouse1: member.id,
          spouse2: member.spouseId,
        });

        // Add to Dagre
        // Set size small. Dagre places it on next rank typically if edges exist.
        dagreGraph.setNode(marriageNodeId, {
          width: MARRIAGE_NODE_SIZE,
          height: MARRIAGE_NODE_SIZE,
        });

        // Check if this couple has children
        const spouse1Children = childrenMap.get(member.id) || [];
        const spouse2Children = childrenMap.get(member.spouseId) || [];
        const hasChildren =
          spouse1Children.length > 0 || spouse2Children.length > 0;

        nodes.push({
          id: marriageNodeId,
          type: "marriage", // Uses MarriageNode
          data: {
            marriageId: marriageNodeId,
            isCollapsed: collapsedIds.has(marriageNodeId),
            hasChildren,
          },
          position: { x: 0, y: 0 },
        });

        // Add edges from spouses to marriage node
        // We use 'smoothstep' for orthogonal feel

        // Edge from Member -> Marriage
        dagreGraph.setEdge(member.id, marriageNodeId);
        edges.push({
          id: `e-${member.id}-${marriageNodeId}`,
          source: member.id,
          target: marriageNodeId,
          type: "smoothstep",
          style: { stroke: "#57534e", strokeWidth: 1.5 },
          animated: false,
        });

        // Edge from Spouse -> Marriage
        dagreGraph.setEdge(member.spouseId, marriageNodeId);
        edges.push({
          id: `e-${member.spouseId}-${marriageNodeId}`,
          source: member.spouseId,
          target: marriageNodeId,
          type: "smoothstep",
          style: { stroke: "#57534e", strokeWidth: 1.5 },
          animated: false,
        });
      }
    }
  });

  // 3. Connect Children
  visibleMembers.forEach((member) => {
    // Determine parent connection
    const father =
      member.fatherId && visibleMemberIds.has(member.fatherId)
        ? member.fatherId
        : null;
    const mother =
      member.motherId && visibleMemberIds.has(member.motherId)
        ? member.motherId
        : null;

    if (father && mother) {
      // Connect to Marriage Node
      const coupleKey = getCoupleKey(father, mother);
      const marriageNode = marriageNodes.get(coupleKey);

      if (marriageNode) {
        dagreGraph.setEdge(marriageNode.id, member.id);
        edges.push({
          id: `e-${marriageNode.id}-${member.id}`,
          source: marriageNode.id,
          target: member.id,
          type: "smoothstep",
          style: { stroke: "#57534e", strokeWidth: 1.5 },
          animated: true,
        });
        return; // Done
      }
    }

    // Fallback: Single parent or parents not married/visible together?
    // Just connect to whoever is available
    if (father) {
      dagreGraph.setEdge(father, member.id);
      edges.push({
        id: `e-${father}-${member.id}`,
        source: father,
        target: member.id,
        type: "smoothstep",
        style: { stroke: "#57534e", strokeWidth: 1.5 },
        animated: true,
      });
    }
    if (mother && !father) {
      // If father exists, we already added edge (or marriage).
      // Wait, if no marriage node but both parents exist (rare?), connect both?
      // Standard graph view: connect both.
      dagreGraph.setEdge(mother, member.id);
      edges.push({
        id: `e-${mother}-${member.id}`,
        source: mother,
        target: member.id,
        type: "smoothstep",
        style: { stroke: "#57534e", strokeWidth: 1.5 },
        animated: true,
      });
    }
  });

  // 4. Run Layout
  dagre.layout(dagreGraph);

  // 5. Apply positions and Post-Process Marriage Nodes
  const layoutedNodes = nodes.map((node) => {
    const nodePos = dagreGraph.node(node.id);
    let x =
      nodePos.x -
      (node.id.startsWith("marriage") ? MARRIAGE_NODE_SIZE : NODE_WIDTH) / 2;
    const y =
      nodePos.y -
      (node.id.startsWith("marriage") ? MARRIAGE_NODE_SIZE : NODE_HEIGHT) / 2;

    // Post-processing for Marriage Nodes:
    // Move them up to be strictly between parents
    if (node.id.startsWith("marriage")) {
      // Find the specific couple entry (slow but safe loop)
      for (const info of marriageNodes.values()) {
        if (info.id === node.id) {
          const p1 = dagreGraph.node(info.spouse1);
          const p2 = dagreGraph.node(info.spouse2);

          if (p1 && p2) {
            // Calculate midpoint
            const midX = (p1.x + p2.x) / 2;
            // Use the Y of the parents (assuming same rank, Dagre usually does this)
            // But we want the visual connection to be at the "bottom" handle of parents?
            // Or center?
            // Standard Nodes: handle is usually bottom/top.
            // Position y is top-left corner.
            // p1.y is center Y in Dagre.
            // We want the Marriage Node to align with the parents' visual center or bottom?
            // User said: "nối ngang với nhau" (connect horizontally).
            // Ideally from center-right of Father to center-left of Mother?
            // Or Bottom-center to Bottom-center?
            // If we use smoothstep, standard handles are Top/Bottom.
            // So edges go Bottom -> Top of Marriage -> Bottom of Marriage -> Top of Child.
            // So Marriage Node should be slightly BELOW the parents to form the horizontal lines.
            // A --(down-over)--> M <--(down-over)-- B
            // If M is at Y = ParentsY + some offset, smoothstep draws vertical then horizontal.
            // We want: A ---- M ---- B
            // This implies A and B handles are SIDE handles? Or M is at same Y.
            // For simplicity with Top/Bottom handles:
            // A(Bottom) -> M(Top). B(Bottom) -> M(Top).
            // If M.y is > A.y, edges go down.
            // If M.y == A.y? Smoothstep might go weird.
            // Let's rely on standard Dagre Y for now (which puts M a rank below)
            // BUT simply center X.
            // The visual result: A and B side-by-side. Lines go down to M. M goes down to Child.
            // This is:
            // A   B
            //  \ /    (curved or angled)
            //   M
            //   |
            //   C
            //
            // The user wanted "nối ngang" (connect horizontally).
            // To fake horizontal connection with TB graph:
            // We can physically place M exactly between A and B, at the SAME Y.
            // And assume edges are drawn from side? No, handles are Top/Bottom.
            // If handles are T/B:
            // We cannot easily draw "A - M - B" horizontal line using Bottom handles, because edges exit downwards.
            // UNLESS we define custom handles for spouses (Right/Left).

            // ALTERNATIVE: Use the standard "Tree" look but tweaked.
            // [Father] [Mother]
            //    |_______|
            //        |
            //     [Child]
            //
            // To achieve this specific look:
            // M is at Y = ParentsY + Height/2 + Gap?
            // M x = Midpoint.
            // Edges A->M and B->M.
            // This produces the "Bracket" look.

            // User request: "node bố mẹ phải nối ngang với nhau, rồi ở giữ đường nối ngang đó..."
            // Literal: Parents connected horizontal line. Middle of that line -> vertical down.
            // This IS the bracket look.
            // So M should be at a specific Y below parents.
            // Dagre likely puts M at Rank 1.
            // Let's ensure M.x is exactly midpoint.

            x = midX - MARRIAGE_NODE_SIZE / 2;
            // Retain Dagre's Y, it's usually correct rank below.
          }
          break;
        }
      }
    }

    return {
      ...node,
      position: { x, y },
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
    };
  });

  return { nodes: layoutedNodes, edges };
};
