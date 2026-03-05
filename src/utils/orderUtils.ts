import type { Order } from "@/types/order";

/**
 * 统一获取订单价格的辅助函数
 * 优先级：报价价格 > 一口价 > 基础价格
 */
export function getOrderPrice(order: Order): number {
  // 如果订单已成交且有报价，使用报价
  if (order.status === "deal" && order.quotedPrice) {
    return order.quotedPrice;
  }
  // 否则使用一口价或基础价格
  return order.fixedPrice || order.price || 0;
}

/**
 * 获取订单基础价格（不考虑报价）
 */
export function getOrderBasePrice(order: Order): number {
  return order.fixedPrice || order.price || 0;
}

/**
 * 计算节省金额
 */
export function getOrderSavings(order: Order): number {
  const basePrice = getOrderBasePrice(order);
  if (order.quotedPrice && order.quotedPrice < basePrice) {
    return basePrice - order.quotedPrice;
  }
  return 0;
}
