import { orderStatus, statusMapping } from "@/config/designSystem";
import type { Order } from "@/types/order";

/**
 * 获取精简后的订单状态
 */
export function getSimplifiedStatus(originalStatus: string) {
  const simplifiedKey = statusMapping[originalStatus] || "pending";
  return orderStatus[simplifiedKey];
}

/**
 * 获取状态标签（带数字前缀）
 */
export function getStatusLabel(originalStatus: string, count?: number): string {
  const status = getSimplifiedStatus(originalStatus);
  return count !== undefined ? `${count}·${status.label}` : status.label;
}

/**
 * 获取状态颜色
 */
export function getStatusColor(originalStatus: string): string {
  const status = getSimplifiedStatus(originalStatus);
  return status.color;
}

/**
 * 获取状态背景色
 */
export function getStatusBgColor(originalStatus: string): string {
  const status = getSimplifiedStatus(originalStatus);
  return status.bgColor;
}

/**
 * 获取状态描述
 */
export function getStatusDescription(originalStatus: string): string {
  const status = getSimplifiedStatus(originalStatus);
  return status.description;
}

/**
 * 判断订单是否可操作
 */
export function isOrderOperatable(originalStatus: string): boolean {
  const simplifiedKey = statusMapping[originalStatus] || "pending";
  return simplifiedKey === "pending" || simplifiedKey === "active";
}

/**
 * 判断订单是否已完成
 */
export function isOrderCompleted(originalStatus: string): boolean {
  const simplifiedKey = statusMapping[originalStatus] || "pending";
  return simplifiedKey === "completed";
}

/**
 * 判断订单是否已取消
 */
export function isOrderCancelled(originalStatus: string): boolean {
  const simplifiedKey = statusMapping[originalStatus] || "pending";
  return simplifiedKey === "cancelled";
}

/**
 * 判断订单是否需要关注
 */
export function isOrderAlert(originalStatus: string): boolean {
  const simplifiedKey = statusMapping[originalStatus] || "pending";
  return simplifiedKey === "alert";
}

/**
 * 获取订单统计按精简状态分组
 */
export function getOrderStatsByStatus(orders: Order[]): Record<string, number> {
  const stats = {
    pending: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    alert: 0,
  };

  orders.forEach((order) => {
    const simplifiedKey = statusMapping[order.status] || "pending";
    stats[simplifiedKey]++;
  });

  return stats;
}

/**
 * 根据精简状态过滤订单
 */
export function filterOrdersByStatus(
  orders: Order[],
  targetStatus: keyof typeof orderStatus
): Order[] {
  return orders.filter((order) => {
    const simplifiedKey = statusMapping[order.status] || "pending";
    return simplifiedKey === targetStatus;
  });
}

/**
 * 状态优先级（用于排序）
 */
const statusPriority: Record<string, number> = {
  alert: 1,      // 需关注最优先
  active: 2,     // 进行中次之
  pending: 3,    // 待处理
  completed: 4,  // 已完成
  cancelled: 5,  // 已取消最后
};

/**
 * 按状态优先级排序订单
 */
export function sortOrdersByStatus(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => {
    const aKey = statusMapping[a.status] || "pending";
    const bKey = statusMapping[b.status] || "pending";
    const aPriority = statusPriority[aKey] || 999;
    const bPriority = statusPriority[bKey] || 999;
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }
    
    // 同优先级按创建时间倒序
    return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
  });
}