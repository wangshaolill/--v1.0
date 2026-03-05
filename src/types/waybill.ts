/**
 * 运单相关类型定义
 */

import type { PaymentMethod } from "./common";

// 运单状态
export type WaybillStatus = 
  | "contracted"          // 已签约（待发货）
  | "pickup_arrived"      // 已到达取货点
  | "in_transit"          // 运输中
  | "crossing_boarding"   // 琼州海峡-登船
  | "crossing_sailing"    // 琼州海峡-航行中
  | "crossing_arrived"    // 琼州海峡-下船
  | "delivery_arrived"    // 已到达收货点
  | "signed"              // 已签收
  | "exception";          // 异常

// 物流轨迹节点类型
export type TrackingPointType = 
  | "contracted"          // 签约
  | "pickup"              // 发货
  | "transit"             // 在途
  | "crossing"            // 过海（琼州海峡特殊节点）
  | "arrival"             // 到达
  | "signed"              // 签收
  | "exception";          // 异常

// 物流轨迹节点
export interface TrackingPoint {
  id: string;
  type: TrackingPointType;
  time: string;
  location: string;
  description: string;
  operator?: string;       // 操作人（司机/货主）
  photos?: string[];       // 现场照片
  signature?: string;      // 签名（签收时）
  remark?: string;         // 备注
}

// 琼州海峡过海信息
export interface CrossingInfo {
  isRequired: boolean;     // 是否需要过海
  boardingPort: string;    // 登船港口（海口港/海安港）
  arrivalPort: string;     // 到达港口
  boardingTime?: string;   // 登船时间
  sailingTime?: string;    // 开航时间
  arrivalTime?: string;    // 到港时间
  shipName?: string;       // 船名
  voyageNumber?: string;   // 航次号
}

// 运单接口
export interface Waybill {
  // 基础信息
  id: string;
  waybillNumber: string;
  orderNumber: string;
  orderId: string;
  contractNumber: string;  // 合同号（与订单共享）
  
  // 🆕 多车运输标识
  vehicleIndex?: number;    // 车辆序号（第几台车，从1开始）
  totalVehicles?: number;   // 总车辆数
  
  // 货物信息
  cargoType: string;  // 统一使用cargoType
  weight: number;
  fromCity: string;  // 统一使用fromCity
  fromDistrict: string;  // 出发区域
  fromStreet: string;  // 出发街道
  toCity: string;    // 统一使用toCity
  toDistrict: string;  // 到达区域
  toStreet: string;  // 到达街道
  
  // 司机和车辆信息
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  vehicleType?: string;
  
  // 时间信息
  departureTime: string;
  estimatedArrival: string;
  createTime: string;
  signedTime?: string;
  
  // 状态信息
  status: WaybillStatus;
  currentLocation: string;
  progress: number;
  exceptionReason?: string;
  
  // 付费信息
  paymentMethod: PaymentMethod;
  amount?: number;
  
  // 物流轨迹
  trackingPoints?: TrackingPoint[];  // 物流轨迹节点
  
  // 琼州海峡信息（广东⇄海南特殊处理）
  crossingInfo?: CrossingInfo;
}