import { useState, useRef, ReactNode } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "motion/react";
import { Trash2, Phone, MoreVertical } from "lucide-react";

interface SwipeAction {
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
  onClick: () => void;
}

interface SwipeableCardProps {
  children: ReactNode;
  actions?: SwipeAction[];
  disabled?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function SwipeableCard({ 
  children, 
  actions = [], 
  disabled = false,
  onSwipeLeft,
  onSwipeRight 
}: SwipeableCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 最大滑动距离
  const maxSwipe = actions.length > 0 ? actions.length * 80 : 0;
  
  // 背景色渐变
  const backgroundColor = useTransform(
    x,
    [-maxSwipe, 0],
    ["rgba(239, 68, 68, 0.1)", "rgba(255, 255, 255, 0)"]
  );

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (disabled) return;
    
    const threshold = 50;
    
    if (info.offset.x < -threshold && actions.length > 0) {
      // 向左滑动，显示操作按钮
      setIsOpen(true);
      x.set(-maxSwipe);
      onSwipeLeft?.();
    } else if (info.offset.x > threshold) {
      // 向右滑动，关闭操作按钮
      setIsOpen(false);
      x.set(0);
      onSwipeRight?.();
    } else {
      // 回弹
      x.set(isOpen ? -maxSwipe : 0);
    }
  };

  const handleActionClick = (action: SwipeAction) => {
    action.onClick();
    // 执行完操作后关闭
    setIsOpen(false);
    x.set(0);
  };

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* 背景操作按钮 */}
      {actions.length > 0 && (
        <motion.div 
          style={{ backgroundColor }}
          className="absolute right-0 top-0 bottom-0 flex items-center"
        >
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={index}
                onClick={() => handleActionClick(action)}
                className={`h-full px-5 flex flex-col items-center justify-center gap-1 ${action.bgColor} active:opacity-80 transition-opacity`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ 
                  opacity: isOpen ? 1 : 0,
                  x: isOpen ? 0 : 20
                }}
                transition={{ delay: index * 0.05 }}
              >
                <Icon className={`w-5 h-5 ${action.color}`} />
                <span className={`text-xs ${action.color} font-medium`}>
                  {action.label}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {/* 可滑动的卡片内容 */}
      <motion.div
        style={{ x }}
        drag={disabled ? false : "x"}
        dragConstraints={{ left: -maxSwipe, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className="relative bg-white"
      >
        {children}
      </motion.div>
    </div>
  );
}

// 预设的常用操作
export const commonActions = {
  delete: {
    icon: Trash2,
    label: "删除",
    color: "text-red-600",
    bgColor: "bg-red-500",
    onClick: () => {}
  },
  call: {
    icon: Phone,
    label: "呼叫",
    color: "text-green-600",
    bgColor: "bg-green-500",
    onClick: () => {}
  },
  more: {
    icon: MoreVertical,
    label: "更多",
    color: "text-gray-600",
    bgColor: "bg-gray-400",
    onClick: () => {}
  }
};