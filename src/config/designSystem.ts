/**
 * 货运宝统一设计系统
 * 基于拼多多活力橙色#FF6034
 */

// ========== 色彩系统 ==========
export const colors = {
  // 品牌色
  primary: {
    main: "#FF6034",      // 品牌主色（活力橙）
    light: "#FF8C66",     // 浅色
    dark: "#E54A1F",      // 深色
    gradient: "linear-gradient(135deg, #FF6034 0%, #FF4444 100%)",
  },
  
  // 功能色
  success: {
    main: "#10B981",      // 成功绿
    light: "#D1FAE5",
    dark: "#059669",
  },
  info: {
    main: "#3B82F6",      // 信息蓝
    light: "#DBEAFE",
    dark: "#1E40AF",
  },
  warning: {
    main: "#F59E0B",      // 警告黄
    light: "#FEF3C7",
    dark: "#D97706",
  },
  error: {
    main: "#EF4444",      // 错误红
    light: "#FEE2E2",
    dark: "#DC2626",
  },
  
  // 中性色
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
  
  // 状态色（精简版）
  status: {
    pending: "#3B82F6",    // 待处理（蓝）
    active: "#F59E0B",     // 进行中（橙）
    completed: "#10B981",  // 已完成（绿）
    cancelled: "#6B7280",  // 已取消（灰）
    alert: "#EF4444",      // 需关注（红）
  },
} as const;

// ========== 间距系统 ==========
export const spacing = {
  xs: "0.25rem",    // 4px
  sm: "0.5rem",     // 8px
  md: "1rem",       // 16px
  lg: "1.5rem",     // 24px
  xl: "2rem",       // 32px
  "2xl": "3rem",    // 48px
  "3xl": "4rem",    // 64px
} as const;

// ========== 圆角系统 ==========
export const radius = {
  none: "0",
  sm: "0.25rem",    // 4px
  md: "0.5rem",     // 8px
  lg: "0.75rem",    // 12px
  xl: "1rem",       // 16px
  "2xl": "1.5rem",  // 24px
  full: "9999px",
} as const;

// ========== 阴影系统 ==========
export const shadows = {
  none: "none",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
} as const;

// ========== 字体系统 ==========
export const typography = {
  fontSize: {
    xs: "0.75rem",      // 12px
    sm: "0.875rem",     // 14px
    base: "1rem",       // 16px
    lg: "1.125rem",     // 18px
    xl: "1.25rem",      // 20px
    "2xl": "1.5rem",    // 24px
    "3xl": "1.875rem",  // 30px
    "4xl": "2.25rem",   // 36px
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.75",
  },
} as const;

// ========== 精简状态系统 ==========
export const orderStatus = {
  // 待处理：已发单、等待报价
  pending: {
    value: "pending",
    label: "待处理",
    color: colors.status.pending,
    bgColor: colors.info.light,
    description: "订单已发布，等待司机响应",
  },
  
  // 进行中：运输中
  active: {
    value: "active",
    label: "进行中",
    color: colors.status.active,
    bgColor: colors.warning.light,
    description: "司机已接单，货物运输中",
  },
  
  // 已完成：成交、送达
  completed: {
    value: "completed",
    label: "已完成",
    color: colors.status.completed,
    bgColor: colors.success.light,
    description: "货物已送达，交易完成",
  },
  
  // 已取消：用户取消、超时取消
  cancelled: {
    value: "cancelled",
    label: "已取消",
    color: colors.status.cancelled,
    bgColor: colors.gray[200],
    description: "订单已取消",
  },
  
  // 需关注：异常、纠纷
  alert: {
    value: "alert",
    label: "需关注",
    color: colors.status.alert,
    bgColor: colors.error.light,
    description: "订单存在异常，需要处理",
  },
} as const;

// 旧状态到新状态的映射
export const statusMapping: Record<string, keyof typeof orderStatus> = {
  // 待处理
  "published": "pending",
  "viewed": "pending",
  "quoted": "pending",
  
  // 进行中
  "read": "active",
  "contracted": "active",
  "pickedUp": "active",
  "inTransit": "active",
  
  // 已完成
  "deal": "completed",
  "delivered": "completed",
  "paid": "completed",
  
  // 已取消
  "cancelled": "cancelled",
  
  // 需关注
  "disputed": "alert",
  "delayed": "alert",
  "exception": "alert",
};

// ========== 动画系统 ==========
export const animations = {
  // 过渡时间
  duration: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
  },
  
  // 缓动函数
  easing: {
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
    spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
  
  // 预设动画
  preset: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    slideUp: {
      from: { transform: "translateY(10px)", opacity: 0 },
      to: { transform: "translateY(0)", opacity: 1 },
    },
    scaleIn: {
      from: { transform: "scale(0.95)", opacity: 0 },
      to: { transform: "scale(1)", opacity: 1 },
    },
  },
} as const;

// ========== 信息密度系统 ==========
export const density = {
  // 卡片内边距
  cardPadding: {
    compact: spacing.sm,      // 紧凑：8px
    normal: spacing.md,       // 正常：16px
    comfortable: spacing.lg,  // 舒适：24px
  },
  
  // 列表项高度
  listItemHeight: {
    compact: "40px",
    normal: "56px",
    comfortable: "72px",
  },
  
  // 元素间距
  gap: {
    tight: spacing.xs,     // 4px
    normal: spacing.sm,    // 8px
    relaxed: spacing.md,   // 16px
  },
} as const;

// ========== 断点系统 ==========
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// ========== Z-index 系统 ==========
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
  toast: 70,
} as const;

// ========== 导出类型 ==========
export type Color = typeof colors;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Shadow = typeof shadows;
export type Typography = typeof typography;
export type OrderStatus = typeof orderStatus;
export type Animation = typeof animations;
export type Density = typeof density;