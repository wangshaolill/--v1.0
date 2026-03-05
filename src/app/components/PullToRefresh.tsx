import { useState, useRef, useEffect, ReactNode } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  disabled?: boolean;
}

export function PullToRefresh({ onRefresh, children, disabled = false }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const y = useMotionValue(0);
  
  // 转换下拉距离为旋转角度
  const rotate = useTransform(y, [0, 80], [0, 360]);
  const scale = useTransform(y, [0, 80], [0.5, 1]);
  const opacity = useTransform(y, [0, 40, 80], [0, 0.5, 1]);

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    // 只有在顶部才允许下拉刷新
    if (container.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || disabled || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    // 只允许向下拉
    if (diff > 0) {
      // 添加阻力效果
      const resistance = 0.5;
      const newY = Math.min(diff * resistance, 100);
      y.set(newY);
      
      // 防止页面滚动
      if (diff > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!isDragging || disabled) return;
    
    setIsDragging(false);
    
    // 如果拉到阈值以上，触发刷新
    if (y.get() >= 60) {
      setIsRefreshing(true);
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        animate(y, 0, {
          type: "spring",
          stiffness: 300,
          damping: 30,
        });
      }
    } else {
      // 回弹
      animate(y, 0, {
        type: "spring",
        stiffness: 300,
        damping: 30,
      });
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, disabled, isRefreshing]);

  return (
    <div ref={containerRef} className="relative h-full overflow-y-auto">
      {/* 下拉刷新指示器 */}
      <motion.div
        style={{ y, opacity }}
        className="absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none z-50"
      >
        <motion.div
          style={{ rotate, scale }}
          className="bg-white rounded-full shadow-lg p-2 mt-2"
        >
          <RefreshCw 
            className={`w-5 h-5 text-blue-500 ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </motion.div>
      </motion.div>

      {/* 内容区域 */}
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}
