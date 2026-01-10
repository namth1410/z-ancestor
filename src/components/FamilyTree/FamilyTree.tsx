"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import ReactFlow, {
  Node,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  NodeTypes,
  ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import { getLayoutedElements } from "./layout";
import { Member } from "@prisma/client";
import CustomNode from "./CustomNode";
import MarriageNode from "./MarriageNode";
import MemberDrawer from "../MemberDrawer/MemberDrawer";
import PasswordModal from "../PasswordModal/PasswordModal";
import ImageViewer from "../ImageViewer/ImageViewer";
import RelationshipModal from "../RelationshipModal/RelationshipModal";
import { Search, Plus, Lock, Unlock, Home, Users } from "lucide-react";
import { deleteMember } from "@/actions/members";
import style from "./FamilyTree.module.scss";
import { normalizeString } from "@/lib/utils";
import Link from "next/link";

interface FamilyTreeProps {
  initialMembers: Member[];
  initialIsAdmin?: boolean;
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  marriage: MarriageNode,
};

const FamilyTree = ({
  initialMembers,
  initialIsAdmin = false,
}: FamilyTreeProps) => {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  // ReactFlow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  // Drawer State
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "create">(
    "view"
  );
  const [drawerDefaultValues, setDrawerDefaultValues] = useState<
    Partial<Member>
  >({});

  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Member[]>([]);

  // Admin Lock State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(initialIsAdmin);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState(false);

  // Sync members
  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  // Layout Calculation
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    return getLayoutedElements(members, collapsedIds);
  }, [members, collapsedIds]);

  // Handle Admin Unlock
  const handleToggleLock = () => {
    if (isAdminUnlocked) {
      setIsAdminUnlocked(false);
    } else {
      setIsPasswordModalOpen(true);
    }
  };

  // Handle Search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const normalized = normalizeString(searchTerm);
    const results = members.filter((m) => {
      const name = normalizeString(`${m.lastName} ${m.firstName}`);
      return name.includes(normalized);
    });
    setSearchResults(results);
  }, [searchTerm, members]);

  const handleSelectSearchResult = (member: Member) => {
    if (rfInstance) {
      const node = nodes.find((n) => n.id === member.id);
      if (node) {
        rfInstance.fitView({
          nodes: [{ id: member.id }],
          padding: 0.5,
          duration: 1000,
        });

        setSelectedMember(member);
        setDrawerMode("view");
        setIsDrawerOpen(true);
        setSearchTerm("");
      }
    }
  };

  const handleToggle = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleViewImage = useCallback((url: string) => {
    setViewImage(url);
  }, []);

  // Update nodes with listeners & layout
  useEffect(() => {
    const nodesWithHandlers = layoutedNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onToggle: handleToggle,
        onViewImage: handleViewImage,
      },
    }));
    setNodes(nodesWithHandlers);
    setEdges(layoutedEdges);
  }, [
    layoutedNodes,
    layoutedEdges,
    setNodes,
    setEdges,
    handleToggle,
    handleViewImage,
  ]);

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    if (node.type === "custom") {
      const member = members.find((m) => m.id === node.id);
      if (member) {
        setSelectedMember(member);
        setDrawerMode("view");
        setIsDrawerOpen(true);
      }
    }
  };

  const handleAddMember = () => {
    setSelectedMember(null);
    setDrawerDefaultValues({});
    setDrawerMode("create");
    setIsDrawerOpen(true);
  };

  const handleAddRelative = (
    type: "child" | "spouse" | "parent",
    member: Member
  ) => {
    const defaults: Partial<Member> = {};
    if (type === "child") {
      if (member.gender === "male") defaults.fatherId = member.id;
      else defaults.motherId = member.id;
      defaults.lastName = member.lastName;
    } else if (type === "spouse") {
      defaults.spouseId = member.id;
    }

    // We want to open the Drawer, NOT the old form component
    setSelectedMember(null);
    setDrawerDefaultValues(defaults);
    setDrawerMode("create");
    setIsDrawerOpen(true); // Open Drawer
  };

  return (
    <div className={style.container}>
      <header className={style.toolbar}>
        <div className="flex items-center">
          <Link href="/" className={style.homeButton} title="Về trang chủ">
            <Home size={20} />
            <span className={style.homeButtonTooltip}>Về trang chủ</span>
          </Link>
        </div>

        <div className={style.actions}>
          <button
            onClick={() => setIsRelationshipModalOpen(true)}
            title="Tra cứu quan hệ họ hàng"
            style={{
              marginRight: "0.5rem",
              borderRadius: "9999px",
              padding: "0.5rem",
              backgroundColor: "#e0f2fe", // sky-100
              color: "#0369a1", // sky-700
              border: "1px solid #7dd3fc", // sky-300
              cursor: "pointer",
            }}
          >
            <Users size={18} />
          </button>

          <button
            onClick={handleToggleLock}
            className={`btn ${
              isAdminUnlocked
                ? "bg-amber-100 text-amber-700 border border-amber-300"
                : "bg-stone-200 text-stone-500"
            }`}
            title={isAdminUnlocked ? "Khóa chế độ sửa" : "Mở khóa chỉnh sửa"}
            style={{
              marginRight: "0.5rem",
              borderRadius: "9999px",
              padding: "0.5rem",
            }}
          >
            {isAdminUnlocked ? <Unlock size={18} /> : <Lock size={18} />}
          </button>

          <div className={style.searchContainer}>
            <div className={style.searchInputWrapper}>
              <Search size={16} className={style.searchIcon} />
              <input
                type="text"
                className={style.searchInput}
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {searchResults.length > 0 && (
              <div className={style.dropdown}>
                {searchResults.map((member) => (
                  <button
                    key={member.id}
                    className={style.dropdownItem}
                    onClick={() => handleSelectSearchResult(member)}
                  >
                    <img
                      src={member.avatar || "/default-avatar.svg"}
                      alt={`${member.lastName} ${member.firstName}`}
                      className={style.avatar}
                    />
                    <span className={style.truncate}>
                      {member.lastName} {member.firstName}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {isAdminUnlocked && (
            <button className="btn btn-primary" onClick={handleAddMember}>
              <Plus size={16} /> Thêm Người Mới
            </button>
          )}
        </div>
      </header>

      <div className={style.treeWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          minZoom={0.1}
          maxZoom={1.5}
          onInit={setRfInstance}
        >
          <Background color="#a8a29e" gap={20} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      <MemberDrawer
        member={selectedMember}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onDelete={async (id) => {
          await deleteMember(id);
          setIsDrawerOpen(false);
        }}
        onDataChange={() => {}}
        members={members}
        mode={drawerMode}
        onSwitchMode={(m) => {
          if ((m === "edit" || m === "create") && !isAdminUnlocked) {
            setIsPasswordModalOpen(true); // Prompt to unlock
            return;
          }
          setDrawerMode(m);
        }}
        defaultValues={drawerDefaultValues}
        onAddRelative={(type, member) => {
          if (!isAdminUnlocked) {
            setIsPasswordModalOpen(true);
            return;
          }
          handleAddRelative(type, member);
        }}
        isAdmin={isAdminUnlocked}
      />

      <PasswordModal
        key={isPasswordModalOpen ? "open" : "closed"}
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => setIsAdminUnlocked(true)}
      />

      {viewImage && (
        <ImageViewer src={viewImage} onClose={() => setViewImage(null)} />
      )}

      <RelationshipModal
        isOpen={isRelationshipModalOpen}
        onClose={() => setIsRelationshipModalOpen(false)}
        members={members}
        initialSourceId={selectedMember?.id}
      />

      <div
        style={{
          position: "fixed",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "12px",
          color: "#666",
          background: "rgba(255,255,255,0.85)",
          padding: "6px 16px",
          borderRadius: "99px",
          zIndex: 50,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          backdropFilter: "blur(4px)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          border: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        🚧 Sản phẩm đang phát triển (Beta). Nếu có sai sót xin vui lòng lượng
        thứ hoặc liên hệ Admin.
      </div>
    </div>
  );
};

export default FamilyTree;
