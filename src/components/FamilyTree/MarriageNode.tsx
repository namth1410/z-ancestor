import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MarriageNodeData {
  marriageId: string;
  isCollapsed: boolean;
  hasChildren: boolean;
  onToggle: (id: string) => void;
}

const MarriageNode = ({ data }: NodeProps<MarriageNodeData>) => {
  const { marriageId, isCollapsed, hasChildren, onToggle } = data;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggle) {
      onToggle(marriageId);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Inputs from Parents */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "transparent", border: "none" }}
        isConnectable={false}
      />

      {/* Center dot/button */}
      {hasChildren ? (
        <button
          onClick={handleToggle}
          style={{
            width: "32px",
            height: "32px",
            background: "rgba(255, 255, 255, 0.9)",
            border: "2px solid #57534e",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
          }}
          title={isCollapsed ? "Mở rộng cây con" : "Thu gọn cây con"}
        >
          {isCollapsed ? (
            <ChevronDown size={16} color="#57534e" />
          ) : (
            <ChevronUp size={16} color="#57534e" />
          )}
        </button>
      ) : (
        <div
          style={{
            width: "10px",
            height: "10px",
            background: "#57534e",
            borderRadius: "50%",
          }}
        />
      )}

      {/* Output to Children */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "transparent", border: "none" }}
        isConnectable={false}
      />
    </div>
  );
};

export default memo(MarriageNode);
