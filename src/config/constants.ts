/**
 * 货运宝全局配置常量
 * 遵循奥卡姆剃刀原则：统一管理所有配置，避免魔法数字和硬编码
 */

// ==================== 时间配置 ====================
export const TIMING = {
  // 司机行为延迟（毫秒）
  DRIVER_VIEW_DELAY: 3000,          // 司机查看订单延迟
  DRIVER_READ_DELAY: 800,           // 司机阅读订单延迟
  DRIVER_CONFIRM_DELAY: 1000,       // 司机确认延迟
  DRIVER_QUOTE_DELAY: 5000,         // 司机报价延迟
  DRIVER_BID_INTERVAL: 2000,        // 竞价间隔
  CONTRACT_MODAL_DELAY: 300,        // 合同弹窗延迟
  CONTRACT_MODAL_AFTER_BOOST: 500,  // 加价后合同弹窗延迟
  
  // 竞价相关
  BIDDING_DEFAULT_DURATION: 30,     // 默认竞价时长（分钟）
  BIDDING_MIN_DURATION: 10,         // 最小竞价时长（分钟）
  BIDDING_MAX_DURATION: 120,        // 最大竞价时长（分钟）
  
  // UI交互
  ANIMATION_DURATION: 300,          // 动画时长
  TRANSITION_DURATION: 200,         // 过渡时长
  DEBOUNCE_DELAY: 500,              // 防抖延迟
  THROTTLE_DELAY: 300,              // 节流延迟
} as const;

// ==================== 业务规则 ====================
export const BUSINESS_RULES = {
  // 载重规则（吨）
  MAX_WEIGHT: 50,                   // 最大载重
  WEIGHT_WARNING_THRESHOLD: 40,    // 载重警告阈值
  WEIGHT_ERROR_THRESHOLD: 50,      // 载重错误阈值
  MIN_WEIGHT: 0.1,                 // 最小载重
  
  // 拆单规则
  MAX_SPLIT_COUNT: 5,              // 最大拆单数量
  MIN_SPLIT_WEIGHT: 1,             // 最小拆单重量（吨）
  MIN_SPLIT_COUNT: 2,              // 最小拆单数量
  
  // 价格规则（元）
  MIN_ORDER_PRICE: 100,            // 最小订单价格
  MAX_ORDER_PRICE: 100000,         // 最大订单价格
  PRICE_BOOST_MIN: 100,            // 最小加价金额
  PRICE_BOOST_STEP: 100,           // 加价步长
  
  // 距离规则（公里）
  MIN_DISTANCE: 1,                 // 最小距离
  MAX_DISTANCE: 3000,              // 最大距离
  
  // 评分规则
  MIN_RATING: 1,                   // 最小评分
  MAX_RATING: 5,                   // 最大评分
  DEFAULT_RATING: 5,               // 默认评分
} as const;

// ==================== UI配置 ====================
export const UI_CONFIG = {
  // 分页配置
  ITEMS_PER_PAGE: 20,              // 每页项目数
  INITIAL_PAGE: 1,                 // 初始页码
  
  // 滚动配置
  SCROLL_TOP_THRESHOLD: 300,       // 显示返回顶部按钮的阈值（px）
  SCROLL_BEHAVIOR: 'smooth' as ScrollBehavior,
  
  // 列表配置
  MAX_VISIBLE_ITEMS: 50,           // 最大可见项目数（虚拟滚动）
  ITEM_HEIGHT: 120,                // 列表项高度（px）
  
  // 表单配置
  MAX_INPUT_LENGTH: 200,           // 最大输入长度
  MAX_TEXTAREA_LENGTH: 500,        // 最大文本域长度
  
  // 图片配置
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 最大图片大小（5MB）
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  
  // Toast配置
  TOAST_DURATION: 3000,            // Toast显示时长
  TOAST_POSITION: 'top-center' as const,
} as const;

// ==================== 品牌配色 ====================
export const BRAND_COLORS = {
  // 主色
  PRIMARY: '#FF6034',              // 货运宝橙
  PRIMARY_LIGHT: '#FF8A5C',        // 货运宝橙（浅）
  PRIMARY_DARK: '#FF4444',         // 货运宝橙（深）
  
  // 功能色
  SUCCESS: '#10B981',              // 成功（绿色）
  WARNING: '#F59E0B',              // 警告（黄色）
  ERROR: '#EF4444',                // 错误（红色）
  INFO: '#3B82F6',                 // 信息（蓝色）
  
  // 中性色
  GRAY_50: '#F9FAFB',
  GRAY_100: '#F3F4F6',
  GRAY_200: '#E5E7EB',
  GRAY_300: '#D1D5DB',
  GRAY_400: '#9CA3AF',
  GRAY_500: '#6B7280',
  GRAY_600: '#4B5563',
  GRAY_700: '#374151',
  GRAY_800: '#1F2937',
  GRAY_900: '#111827',
  
  // 背景色
  BG_WHITE: '#FFFFFF',
  BG_GRAY: '#F9FAFB',
  BG_DARK: '#111827',
} as const;

// ==================== 订单状态 ====================
export const ORDER_STATUS = {
  PUBLISHED: 'published' as const,   // 已发布
  VIEWED: 'viewed' as const,         // 已查看
  QUOTED: 'quoted' as const,         // 已报价
  READ: 'read' as const,             // 已阅读
  CONTRACTED: 'contracted' as const, // 已签约
  DEAL: 'deal' as const,             // 已成交
  CANCELLED: 'cancelled' as const,   // 已取消
} as const;

// 订单状态标签配置
export const ORDER_STATUS_CONFIG = {
  [ORDER_STATUS.PUBLISHED]: {
    label: '待接单',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    badgeVariant: 'default' as const,
  },
  [ORDER_STATUS.VIEWED]: {
    label: '已查看',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    badgeVariant: 'secondary' as const,
  },
  [ORDER_STATUS.QUOTED]: {
    label: '已报价',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    badgeVariant: 'default' as const,
  },
  [ORDER_STATUS.READ]: {
    label: '已阅读',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    badgeVariant: 'secondary' as const,
  },
  [ORDER_STATUS.CONTRACTED]: {
    label: '待支付',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    badgeVariant: 'outline' as const,
  },
  [ORDER_STATUS.DEAL]: {
    label: '已成交',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    badgeVariant: 'default' as const,
  },
  [ORDER_STATUS.CANCELLED]: {
    label: '已取消',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    badgeVariant: 'outline' as const,
  },
} as const;

// ==================== 运单状态 ====================
export const WAYBILL_STATUS = {
  PENDING: 'pending' as const,       // 待派单
  DISPATCHED: 'dispatched' as const, // 已派单
  PICKED_UP: 'picked_up' as const,   // 已提货
  PICKUP_ARRIVED: 'pickup_arrived' as const, // 到达发货点
  IN_TRANSIT: 'in_transit' as const, // 运输中
  DELIVERY_ARRIVED: 'delivery_arrived' as const, // 到达收货点
  DELIVERED: 'delivered' as const,   // 已送达
  SIGNED: 'signed' as const,         // 已签收
  COMPLETED: 'completed' as const,   // 已完成
  EXCEPTION: 'exception' as const,   // 异常
} as const;

// 运单状态标签配置
export const WAYBILL_STATUS_CONFIG = {
  [WAYBILL_STATUS.PENDING]: {
    label: '待派单',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    badgeVariant: 'default' as const,
  },
  [WAYBILL_STATUS.DISPATCHED]: {
    label: '已派单',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    badgeVariant: 'default' as const,
  },
  [WAYBILL_STATUS.PICKED_UP]: {
    label: '已提货',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    badgeVariant: 'secondary' as const,
  },
  [WAYBILL_STATUS.PICKUP_ARRIVED]: {
    label: '待发货',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    badgeVariant: 'default' as const,
  },
  [WAYBILL_STATUS.IN_TRANSIT]: {
    label: '运输中',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    badgeVariant: 'default' as const,
  },
  [WAYBILL_STATUS.DELIVERY_ARRIVED]: {
    label: '待卸货',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    badgeVariant: 'default' as const,
  },
  [WAYBILL_STATUS.DELIVERED]: {
    label: '已送达',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    badgeVariant: 'secondary' as const,
  },
  [WAYBILL_STATUS.SIGNED]: {
    label: '已签收',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    badgeVariant: 'default' as const,
  },
  [WAYBILL_STATUS.COMPLETED]: {
    label: '已完成',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    badgeVariant: 'default' as const,
  },
  [WAYBILL_STATUS.EXCEPTION]: {
    label: '异常',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    badgeVariant: 'destructive' as const,
  },
} as const;

// ==================== Toast消息配置 ====================
export const TOAST_MESSAGES = {
  // 订单相关
  ORDER_SUBMITTED: {
    title: '订单已提交',
    description: '司机正在查看您的订单...',
  },
  ORDER_VIEWED: {
    title: '司机已查看',
    description: '司机正在评估订单...',
  },
  ORDER_QUOTED: {
    title: '收到报价',
    description: '司机已提交报价，请查看选择',
  },
  ORDER_CONFIRMED: {
    title: '司机已确认',
    description: '请签署电子合同',
  },
  ORDER_CANCELLED: {
    title: '订单已取消',
    description: '订单已从列表中移除',
  },
  FIRST_BID_RECEIVED: {
    title: '收到第一个报价',
    description: '司机正在陆续报价中...',
  },
  PRICE_BOOSTED: {
    title: '加价成功',
    description: '运费已提升，订单已重新推送',
  },
  
  // 合同相关
  CONTRACT_SIGNED: {
    title: '合同已签署',
    description: '请完成支付',
  },
  CONTRACT_SIGNED_COD: {
    title: '合同已签署',
    description: '订单已转为运单，到付无需支付',
  },
  CONTRACT_SIGNED_SPLIT: {
    title: '合同已签署',
    description: '子订单需支付',
  },
  CONTRACT_SIGNED_SPLIT_COD: {
    title: '合同已签署',
    description: '已生成运单，到付无需支付',
  },
  
  // 支付相关
  PAYMENT_SUCCESS: {
    title: '支付成功',
    description: '订单已转为运单',
  },
  PAYMENT_SUCCESS_SPLIT: {
    title: '支付成功',
    description: '已生成运单',
  },
  
  // 运单相关
  WAYBILL_CREATED: {
    title: '运单已生成',
    description: '可在运单模块查看',
  },
  WAYBILL_DISPATCHED: {
    title: '派单成功',
    description: '已成功派发运单',
  },
  WAYBILL_PICKED_UP: {
    title: '已提货',
    description: '司机已提货，正在运输中',
  },
  WAYBILL_DELIVERED: {
    title: '已送达',
    description: '货物已送达目的地',
  },
  WAYBILL_SIGNED: {
    title: '已签收',
    description: '货物已确认签收',
  },
  WAYBILL_DELETED: {
    title: '运单已删除',
    description: '运单已从列表中移除',
  },
  
  // 错误提示
  ERROR_NETWORK: {
    title: '网络错误',
    description: '请检查网络连接后重试',
  },
  ERROR_SERVER: {
    title: '服务器错误',
    description: '服务暂时不可用，请稍后重试',
  },
  ERROR_VALIDATION: {
    title: '数据验证失败',
    description: '请检查输入信息是否正确',
  },
  ERROR_UNKNOWN: {
    title: '操作失败',
    description: '发生未知错误，请重试',
  },
} as const;

// ==================== 本地存储Key ====================
export const STORAGE_KEYS = {
  ORDERS: 'yunlibao_orders',
  WAYBILLS: 'yunlibao_waybills',
  USER_INFO: 'yunlibao_user_info',
  USER_PREFS: 'yunlibao_user_prefs',
  ONBOARDING: 'yunlibao_onboarding_seen',
  FILTERS: 'yunlibao_filters',
  RECENT_ROUTES: 'yunlibao_recent_routes',
} as const;

// ==================== 正则表达式 ====================
export const REGEX = {
  PHONE: /^1[3-9]\d{9}$/,                    // 手机号
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,       // 邮箱
  ID_CARD: /^\d{17}[\dXx]$/,                 // 身份证号
  PLATE_NUMBER: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4,5}[A-HJ-NP-Z0-9挂学警港澳]$/,  // 车牌号
  POSTAL_CODE: /^\d{6}$/,                    // 邮政编码
  NUMBER: /^\d+$/,                           // 纯数字
  DECIMAL: /^\d+(\.\d{1,2})?$/,             // 小数（最多2位）
  CHINESE: /^[\u4e00-\u9fa5]+$/,             // 纯中文
} as const;

// ==================== API配置 ====================
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.yunlibao.com',
  TIMEOUT: 30000,                   // 请求超时（毫秒）
  RETRY_COUNT: 3,                   // 重试次数
  RETRY_DELAY: 1000,                // 重试延迟（毫秒）
} as const;

// ==================== 功能开关 ====================
export const FEATURE_FLAGS = {
  ENABLE_ONBOARDING: true,          // 启用新手引导
  ENABLE_DRIVER_SIMULATION: true,   // 启用司机模拟
  ENABLE_REAL_TIME_TRACKING: false, // 启用实时追踪（待开发）
  ENABLE_VOICE_INPUT: false,        // 启用语音输入（待开发）
  ENABLE_AI_RECOMMENDATION: false,  // 启用AI推荐（待开发）
  ENABLE_ANALYTICS: true,           // 启用数据分析
  ENABLE_ERROR_REPORTING: true,     // 启用错误上报
} as const;

// ==================== 司机模拟配置 ====================
export const MOCK_DRIVERS = [
  { 
    id: "BID1", 
    driverName: "李师傅", 
    rating: 4.9, 
    orderCount: 328,
    vehicleInfo: "9.6米厢式货车",
    vehicleNumber: "粤B12345",
    driverPhone: "13800138001"
  },
  { 
    id: "BID2", 
    driverName: "王师傅", 
    rating: 4.8, 
    orderCount: 256,
    vehicleInfo: "9.6米厢式货车",
    vehicleNumber: "粤B23456",
    driverPhone: "13800138002"
  },
  { 
    id: "BID3", 
    driverName: "张师傅", 
    rating: 4.7, 
    orderCount: 189,
    vehicleInfo: "9.6米厢式货车",
    vehicleNumber: "粤B34567",
    driverPhone: "13800138003"
  },
  { 
    id: "BID4", 
    driverName: "刘师傅", 
    rating: 4.6, 
    orderCount: 145,
    vehicleInfo: "9.6米厢式货车",
    vehicleNumber: "粤B45678",
    driverPhone: "13800138004"
  },
] as const;

// 一口价司机配置
export const FIXED_PRICE_DRIVER = {
  driverName: "李师傅",
  vehicleNumber: "粤B88888",
  driverPhone: "13800138000",
  rating: 4.9,
  orderCount: 328,
} as const;

// ==================== 类型导出 ====================
export type OrderStatusType = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
export type WaybillStatusType = typeof WAYBILL_STATUS[keyof typeof WAYBILL_STATUS];
export type ToastMessageKey = keyof typeof TOAST_MESSAGES;