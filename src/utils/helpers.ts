/**
 * 通用辅助函数
 * 遵循奥卡姆剃刀原则：封装重复逻辑，提供简洁API
 */

import { toast } from "sonner";
import { TOAST_MESSAGES, type ToastMessageKey } from "@/config/constants";

// ==================== 数组操作 ====================

/**
 * 根据ID更新数组中的项
 * @example
 * const orders = updateItemById(orders, "123", { status: "completed" });
 */
export function updateItemById<T extends { id: string }>(
  items: T[],
  id: string,
  updates: Partial<T>
): T[] {
  return items.map(item => 
    item.id === id ? { ...item, ...updates } : item
  );
}

/**
 * 根据ID查找项
 */
export function findItemById<T extends { id: string }>(
  items: T[],
  id: string
): T | undefined {
  return items.find(item => item.id === id);
}

/**
 * 根据ID删除项
 */
export function removeItemById<T extends { id: string }>(
  items: T[],
  id: string
): T[] {
  return items.filter(item => item.id !== id);
}

/**
 * 批量更新项
 */
export function batchUpdateItems<T extends { id: string }>(
  items: T[],
  updates: T[]
): T[] {
  const updateMap = new Map(updates.map(item => [item.id, item]));
  return items.map(item => updateMap.get(item.id) || item);
}

/**
 * 根据条件过滤项
 */
export function filterItems<T>(
  items: T[],
  predicate: (item: T) => boolean
): T[] {
  return items.filter(predicate);
}

/**
 * 根据字段分组
 */
export function groupBy<T, K extends keyof T>(
  items: T[],
  key: K
): Map<T[K], T[]> {
  return items.reduce((map, item) => {
    const groupKey = item[key];
    const group = map.get(groupKey) || [];
    group.push(item);
    map.set(groupKey, group);
    return map;
  }, new Map<T[K], T[]>());
}

// ==================== 异步操作 ====================

/**
 * 延迟执行
 * @example
 * await delay(1000); // 延迟1秒
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 带超时的Promise
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = "Operation timed out"
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await delay(delayMs * (i + 1)); // 指数退避
      }
    }
  }
  
  throw lastError!;
}

// ==================== Toast辅助 ====================

/**
 * 显示Toast消息
 * @example
 * showToast("ORDER_CONFIRMED"); // 显示预定义消息
 * showToast("ORDER_CONFIRMED", "success"); // 指定类型
 */
export function showToast(
  key: ToastMessageKey,
  type: "success" | "error" | "info" | "warning" = "success"
): void {
  const message = TOAST_MESSAGES[key];
  
  switch (type) {
    case "success":
      toast.success(message.title, { description: message.description });
      break;
    case "error":
      toast.error(message.title, { description: message.description });
      break;
    case "info":
      toast.info(message.title, { description: message.description });
      break;
    case "warning":
      toast.warning(message.title, { description: message.description });
      break;
  }
}

/**
 * 显示自定义Toast
 */
export function showCustomToast(
  title: string,
  description?: string,
  type: "success" | "error" | "info" | "warning" = "info"
): void {
  toast[type](title, description ? { description } : undefined);
}

/**
 * 显示加载Toast
 */
export function showLoadingToast(message: string = "处理中..."): string | number {
  return toast.loading(message);
}

/**
 * 关闭Toast
 */
export function dismissToast(id: string | number): void {
  toast.dismiss(id);
}

// ==================== 日期时间 ====================

/**
 * 格式化当前时间
 * @example
 * getCurrentTime() // "2026-02-06 14:30:25"
 */
export function getCurrentTime(): string {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * 获取相对时间
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  // 使用formatters.ts中的formatDate
  return d.toLocaleDateString('zh-CN');
}

// ==================== 数字格式化 ====================
// 注意：formatPrice, formatWeight 已在 formatters.ts 中定义，避免重复

/**
 * 格式化数字（千分位）
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN');
}

/**
 * 格式化距离
 */
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)}米`;
  }
  return `${distance.toFixed(1)}公里`;
}

/**
 * 格式化百分比
 */
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

// ==================== 字符串处理 ====================

/**
 * 脱敏手机号
 * @example
 * maskPhone("13800138000") // "138****8000"
 */
export function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 脱敏邮箱
 * @example
 * maskEmail("test@example.com") // "t***@example.com"
 */
export function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  const masked = username.charAt(0) + '***' + (username.length > 1 ? username.charAt(username.length - 1) : '');
  return `${masked}@${domain}`;
}

/**
 * 脱敏身份证号
 */
export function maskIdCard(idCard: string): string {
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
}

/**
 * 脱敏银行卡号
 */
export function maskBankCard(cardNumber: string): string {
  return cardNumber.replace(/(\d{4})\d+(\d{4})/, '$1****$2');
}

/**
 * 截断文本
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * 首字母大写
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ==================== 对象操作 ====================

/**
 * 深拷贝
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 检查对象是否为空
 */
export function isEmpty(obj: any): boolean {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
}

/**
 * 合并对象（深度合并）
 */
export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;
  const source = sources.shift();
  
  if (source === undefined) return target;
  
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key] as any, source[key] as any);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  
  return deepMerge(target, ...sources);
}

function isObject(item: any): item is object {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// ==================== URL处理 ====================

/**
 * 构建查询字符串
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * 解析查询字符串
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(queryString);
  
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
}

// ==================== 防抖节流 ====================

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// ==================== 随机数生成 ====================

/**
 * 生成随机ID
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}${timestamp}${random}`;
}

/**
 * 生成订单号
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString().slice(2, 8);
  return `ORD${year}${month}${day}${random}`;
}

/**
 * 生成运单号
 */
export function generateWaybillNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString().slice(2, 8);
  return `WB${year}${month}${day}${random}`;
}

/**
 * 生成合同号
 */
export function generateContractNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString().slice(2, 8);
  return `CT${year}${month}${day}${random}`;
}

// ==================== 浏览器相关 ====================

/**
 * 复制到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * 获取设备类型
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * 检查是否为移动设备
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * 平滑滚动到顶部
 */
export function scrollToTop(behavior: ScrollBehavior = 'smooth'): void {
  window.scrollTo({ top: 0, behavior });
}

/**
 * 平滑滚动到元素
 */
export function scrollToElement(
  element: HTMLElement | string,
  behavior: ScrollBehavior = 'smooth'
): void {
  const el = typeof element === 'string' 
    ? document.querySelector(element) as HTMLElement
    : element;
    
  if (el) {
    el.scrollIntoView({ behavior, block: 'start' });
  }
}

// ==================== 验证函数 ====================

/**
 * 验证手机号
 */
export function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 验证邮箱
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 验证身份证号
 */
export function isValidIdCard(idCard: string): boolean {
  return /^\d{17}[\dXx]$/.test(idCard);
}

/**
 * 验证车牌号
 */
export function isValidPlateNumber(plateNumber: string): boolean {
  return /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4,5}[A-HJ-NP-Z0-9挂学警港澳]$/.test(plateNumber);
}

// ==================== 数据转换 ====================

/**
 * 安全的JSON解析
 */
export function safeJsonParse<T>(jsonString: string, defaultValue: T): T {
  try {
    return JSON.parse(jsonString);
  } catch {
    return defaultValue;
  }
}

/**
 * 安全的数字转换
 */
export function safeParseFloat(value: any, defaultValue: number = 0): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * 安全的整数转换
 */
export function safeParseInt(value: any, defaultValue: number = 0): number {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}