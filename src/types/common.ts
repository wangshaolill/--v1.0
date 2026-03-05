/**
 * 共享类型定义
 * 遵循 DRY 原则，避免类型重复定义
 */

// 付款方式
export type PaymentMethod = "prepaid" | "collect";

// 状态配置基础接口
export interface StatusConfig {
  label: string;
  color: string;
  description: string;
}

// 全局业务常量
export const CUSTOMER_SERVICE_PHONE = "400-800-8888";
export const APP_NAME = "货运宝";
export const BRAND_COLOR = "#FF6034";
export const BRAND_COLOR_SECONDARY = "#FF8A5C";

// 日期格式化选项
export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
};