import { ReactNode, useState } from "react";

// 卡片悬浮效果（唯一被使用的组件）
interface HoverCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function HoverCard({ children, className = "", onClick }: HoverCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const style = {
    transition: "all 0.2s ease-out",
    transform: isHovered ? "translateY(-4px)" : "translateY(0)",
    boxShadow: isHovered
      ? "0 10px 25px -5px rgba(0, 0, 0, 0.15)"
      : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  };

  return (
    <div
      style={style}
      className={className}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
}
