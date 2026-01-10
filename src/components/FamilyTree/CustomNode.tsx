import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Member } from "@prisma/client";
import { ChevronDown, ChevronUp } from "lucide-react";
import styles from "./CustomNode.module.scss";
import clsx from "clsx";

type CustomData = {
  member: Member;
  isCollapsed: boolean;
  hasChildren: boolean;
  onToggle: (id: string) => void;
  onViewImage?: (url: string) => void;
};

const CustomNode = ({ data }: NodeProps<CustomData>) => {
  const { member, isCollapsed, hasChildren, onToggle, onViewImage } = data;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(member.id);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (member.avatar && onViewImage) {
      onViewImage(member.avatar);
    }
  };

  const displayName = `${member.lastName} ${member.firstName}`;
  const birthYear = member.birthDate
    ? new Date(member.birthDate).getFullYear()
    : "?";
  const deathYear = member.deathDate
    ? new Date(member.deathDate).getFullYear()
    : "";
  const dateStr = deathYear
    ? `${birthYear} - ${deathYear}`
    : `Sinh: ${birthYear}`;

  return (
    <div className={clsx(styles.node, styles[member.gender.toLowerCase()])}>
      <Handle type="target" position={Position.Top} className={styles.handle} />

      <img
        src={member.avatar || "/default-avatar.svg"}
        alt={displayName}
        onClick={handleImageClick}
        className={clsx(
          styles.avatar,
          !member.avatar && styles.placeholderAvatar,
          member.avatar && "cursor-pointer hover:opacity-90 transition-opacity"
        )}
      />

      <div className={styles.info}>
        <div className={styles.name} title={displayName}>
          {displayName}
        </div>
        <div className={styles.dates}>{dateStr}</div>
        {member.occupation && (
          <div className={styles.role}>{member.occupation}</div>
        )}
      </div>

      {/* Only show toggle for single parents (no spouse) */}
      {hasChildren && !member.spouseId && (
        <button className={styles.toggleBtn} onClick={handleToggle}>
          {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-stone-400"
      />
    </div>
  );
};

export default memo(CustomNode);
