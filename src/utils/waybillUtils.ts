import type { Order } from "@/types/order";
import type { Waybill } from "@/types/waybill";
import { 
  needsCrossing, 
  generateCrossingInfo, 
  generateTrackingPoints,
  calculateProgress 
} from "./crossingUtils";

/**
 * 从订单创建运单
 * @param order 订单数据
 * @param index 拆单索引（可选）
 * @returns 运单对象
 */
export function createWaybillFromOrder(order: Order, index?: number): Waybill {
  const timestamp = Date.now();
  const baseNumber = timestamp.toString().slice(-8);
  
  // 计算预计到达时间（出发时间+2天）
  const departureDate = new Date(order.pickupTime);
  const estimatedDate = new Date(departureDate);
  estimatedDate.setDate(estimatedDate.getDate() + 2);
  const estimatedArrival = estimatedDate.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-');
  
  // 检测是否需要过琼州海峡
  const hasCrossing = needsCrossing(order.fromCity, order.toCity);
  const crossingInfo = hasCrossing ? generateCrossingInfo(order.fromCity, order.toCity) : undefined;
  
  // 生成初始物流轨迹
  const trackingPoints = generateTrackingPoints(
    order.fromCity,
    order.toCity,
    new Date().toLocaleString(),
    order.driverName || "司机"
  );
  
  // 初始状态：contracted（已签约，待发货）
  const initialStatus = "contracted";
  const initialProgress = calculateProgress(initialStatus, hasCrossing);
  
  return {
    id: index !== undefined ? `WB${timestamp}_${index}` : `WB${timestamp}`,
    waybillNumber: index !== undefined ? `${baseNumber}-${index + 1}` : baseNumber,
    orderId: order.id,
    orderNumber: order.orderNumber,
    contractNumber: order.contractNumber,
    
    // 🆕 多车运输标识
    vehicleIndex: order.vehicleIndex,      // 车辆序号
    totalVehicles: order.totalVehicles,    // 总车辆数
    
    cargoType: order.cargoType,
    weight: order.weight,
    fromCity: order.fromCity,
    fromDistrict: order.pickupAddress.split(/[市区]/)[1]?.split(/[区]/)[0] + '区' || '中心区',
    fromStreet: order.pickupAddress.split(/[区]/)[1] || order.pickupAddress,
    toCity: order.toCity,
    toDistrict: order.deliveryAddress.split(/[市区]/)[1]?.split(/[区]/)[0] + '区' || '中心区',
    toStreet: order.deliveryAddress.split(/[区]/)[1] || order.deliveryAddress,
    driverName: order.driverName || '',
    driverPhone: order.driverPhone || '',
    vehicleNumber: order.vehicleNumber || '',
    vehicleType: order.vehicleType,
    departureTime: order.pickupTime,
    estimatedArrival,
    createTime: new Date().toLocaleString(),
    status: initialStatus,
    currentLocation: `${order.fromCity} - 合同已签署，待发货`,
    progress: initialProgress,
    paymentMethod: order.paymentMethod,
    amount: order.fixedPrice || order.quotedPrice,
    trackingPoints,
    crossingInfo,
  };
}

/**
 * 批量创建运单（用于拆单场景）
 * @param orders 订单数组
 * @param parentWaybillId 父运单ID（可选）
 * @returns 运单数组
 */
export function createWaybillsFromOrders(orders: Order[], parentWaybillId?: string): Waybill[] {
  return orders.map((order, index) => createWaybillFromOrder(order, index));
}