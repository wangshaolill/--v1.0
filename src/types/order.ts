/**
 * 订单相关类型定义
 */

import type { PaymentMethod } from "./common";

// 司机报价信息
export interface DriverBid {
  id: string;
  driverName: string;
  rating: number;
  orderCount: number;
  price: number;
  vehicleInfo: string;
  vehicleNumber: string;
  driverPhone: string;
  bidTime: string;
}

// 订单状态
export type OrderStatus = 
  | "pending"      // 待接单 - 订单已发布，等待司机响应
  | "quoted"       // 报价中 - 已有司机报价（仅竞价）
  | "confirmed"    // 已确认 - 货主选定司机/司机接单
  | "signed"       // 已签约 - 双方已签电子合同
  | "completed"    // 已完成 - 运输完成，可评价
  | "cancelled";   // 已取消

// 报价方式
export type PricingMethod = "fixed" | "bidding";

// 订单接口
export interface Order {
  // 基础信息
  id: string;
  orderNumber: string;
  contractNumber: string;  // 合同号（拆单订单共享同一合同号）
  route: string;
  fromCity: string;
  toCity: string;
  createTime: string;
  
  // 多车运输关联关系
  parentOrderId?: string;  // 🆕 父订单ID（子订单专用）
  childOrderIds?: string[];  // 🆕 子订单ID列表（主订单专用）
  vehicleIndex?: number;  // 🆕 车辆序号（子订单专用，从1开始）
  totalVehicles?: number;  // 🆕 总车辆数（主订单专用）
  
  // 货物信息
  cargoType: string;
  weight: number;
  
  // 车型信息
  vehicleType?: string;        // 车型名称，如"9.6米厢式货车"
  vehicleLength?: number;      // 车长(米)
  vehicleWidth?: number;       // 车宽(米)
  vehicleHeight?: number;      // 车高(米)
  vehicleCapacity?: number;    // 载重(吨)
  
  // 详细地址信息
  pickupAddress: string;
  pickupContact: string;
  pickupPhone: string;
  pickupTime: string;
  deliveryAddress: string;
  deliveryContact: string;
  deliveryPhone: string;
  
  // 要求信息
  loadingRequirement?: string;
  specialRequirement?: string;
  
  // 价格信息
  paymentMethod: PaymentMethod;
  pricingMethod: PricingMethod;
  price: number;  // 订单价格（基础价格）
  fixedPrice?: number;  // 一口价金额
  biddingDuration?: number;  // 竞价时长（小时）
  minAcceptablePrice?: number;  // 🆕 最低接受价（竞价订单专用，仅货主可见）
  fixedPriceTimeout?: boolean;  // 🆕 一口价超时监控已启动（内部标志）
  
  // 🆕 支付信息（全款预付模式）
  paymentAmount?: number;  // 应付金额（全款）
  paymentPaid?: boolean;  // 是否已支付
  paymentPaidTime?: string;  // 支付时间
  paymentTransactionId?: string;  // 交易流水号
  paymentMethod_type?: "wechat" | "alipay";  // 支付方式（微信/支付宝）
  
  // 状态信息
  status: OrderStatus;
  
  // 司机信息（成交后）
  driverName?: string;
  vehicleNumber?: string;
  driverPhone?: string;
  rating?: number;
  review?: string;
  
  // 报价信息
  quotedPrice?: number;
  viewedTime?: string;
  quotedTime?: string;
  viewerCount?: number;
  quoterCount?: number;
  
  // 竞价订单特有
  driverBids?: DriverBid[];  // 司机报价列表
  selectedBidId?: string;  // 选中的报价ID
  selectedBidTime?: string;  // 🆕 选择司机的时间（用于10分钟内撤销）
  canCancelSelection?: boolean;  // 🆕 是否可撤销选择
  biddingCloseTime?: string;  // 🆕 竞价截止时间
  biddingStatus?: "active" | "no_bids" | "expired" | "selected" | "closed";  // 🆕 竞价状态
  convertedToFixed?: boolean;  // 🆕 是否已转为一口价
  
  // 司机行为追踪
  readByDriver?: boolean;    // 司机是否已阅读
  readTime?: string;         // 阅读时间
  contractTime?: string;     // 签约时间
  
  // 派单范围
  dispatchRange?: "familiar" | "return" | "full";
}