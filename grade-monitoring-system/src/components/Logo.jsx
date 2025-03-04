import { ClusterOutlined } from "@ant-design/icons";
import React from "react";

export default function Logo({ isCollapse, setCollapse }) {
  return (
    <div className="logo">
      <div
        className="logoIcon"
        style={{
          marginTop: "10px",
          fontSize: "40px",
          transition: "transform 0.3s ease",
          transform: isCollapse ? "scale(1.2)" : "scale(1)",
          animation: "logoSpin 1s ease-in-out",
          color: "white",
          cursor: "pointer",
        }}
        onClick={() => setCollapse(!isCollapse)}
      >
        <ClusterOutlined />
      </div>
      {!isCollapse && (
        <p
          className="logoName"
          style={{
            animation: "slideIn 0.5s ease-out",
          }}
        >
          GRADING SYSTEM
        </p>
      )}
      <style>
        {`
          @keyframes logoSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1; 
              transform: translateX(0);
            }
          }
        `}
      </style>
    </div>
  );
}
