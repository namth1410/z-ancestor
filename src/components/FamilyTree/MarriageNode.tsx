import React, { memo } from "react";
import { Handle, Position } from "reactflow";

const MarriageNode = () => {
  return (
    <div
      style={{
        width: "10px",
        height: "10px",
        background: "#57534e", // stone-600
        borderRadius: "50%",
        position: "relative",
      }}
    >
      {/* Inputs from Parents */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "transparent", border: "none" }}
        isConnectable={false}
      />
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
