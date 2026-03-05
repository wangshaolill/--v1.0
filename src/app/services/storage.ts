// 统一数据存储服务
import type { Order } from "@/types/order";

// 地址数据类型
export interface AddressData {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  loadingNote?: string;
  isDefault: boolean;
  type: "sender" | "receiver";
  createdAt: string;
  usedCount: number; // 使用次数，用于排序
}

// 运单数据类型
export interface WaybillData {
  id: string;
  orderId: string;
  orderNumber: string;
  status: "pending" | "in_transit" | "arrived" | "signed" | "completed";
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  vehicleType: string;
  fromCity: string;
  toCity: string;
  fromAddress: string;
  toAddress: string;
  cargo: string;
  weight: string;
  freight: number;
  estimatedArrival?: string;
  actualArrival?: string;
  createdAt: string;
  updatedAt: string;
  timeline: Array<{
    time: string;
    status: string;
    description: string;
    location?: string;
  }>;
}

// Storage Keys
const KEYS = {
  SENDER_ADDRESSES: "yunlibao_sender_addresses",
  RECEIVER_ADDRESSES: "yunlibao_receiver_addresses",
  ORDERS: "yunlibao_orders",
  WAYBILLS: "yunlibao_waybills",
};

// 地址管理
export const AddressStorage = {
  // 获取所有地址
  getAll(type: "sender" | "receiver"): AddressData[] {
    const key = type === "sender" ? KEYS.SENDER_ADDRESSES : KEYS.RECEIVER_ADDRESSES;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // 保存地址
  save(address: AddressData): void {
    const addresses = this.getAll(address.type);
    const index = addresses.findIndex(a => a.id === address.id);
    
    if (index >= 0) {
      addresses[index] = address;
    } else {
      addresses.push(address);
    }

    // 如果设为默认，取消其他默认地址
    if (address.isDefault) {
      addresses.forEach(a => {
        if (a.id !== address.id) a.isDefault = false;
      });
    }

    const key = address.type === "sender" ? KEYS.SENDER_ADDRESSES : KEYS.RECEIVER_ADDRESSES;
    localStorage.setItem(key, JSON.stringify(addresses));
  },

  // 删除地址
  delete(id: string, type: "sender" | "receiver"): void {
    const addresses = this.getAll(type).filter(a => a.id !== id);
    const key = type === "sender" ? KEYS.SENDER_ADDRESSES : KEYS.RECEIVER_ADDRESSES;
    localStorage.setItem(key, JSON.stringify(addresses));
  },

  // 获取默认地址
  getDefault(type: "sender" | "receiver"): AddressData | null {
    const addresses = this.getAll(type);
    return addresses.find(a => a.isDefault) || null;
  },

  // 增加使用次数
  incrementUsage(id: string, type: "sender" | "receiver"): void {
    const addresses = this.getAll(type);
    const address = addresses.find(a => a.id === id);
    if (address) {
      address.usedCount++;
      const key = type === "sender" ? KEYS.SENDER_ADDRESSES : KEYS.RECEIVER_ADDRESSES;
      localStorage.setItem(key, JSON.stringify(addresses));
    }
  },

  // 获取常用地址（按使用次数排序）
  getFrequent(type: "sender" | "receiver", limit = 3): AddressData[] {
    return this.getAll(type)
      .filter(a => a.usedCount > 0)
      .sort((a, b) => b.usedCount - a.usedCount)
      .slice(0, limit);
  },
};

// 订单管理
export const OrderStorage = {
  // 获取所有订单
  getAll(): Order[] {
    try {
      const data = localStorage.getItem(KEYS.ORDERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // 保存订单
  save(order: Order): void {
    const orders = this.getAll();
    const index = orders.findIndex(o => o.id === order.id);
    
    if (index >= 0) {
      orders[index] = order;
    } else {
      orders.unshift(order); // 新订单放在前面
    }

    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  },

  // 获取单个订单
  getById(id: string): Order | null {
    return this.getAll().find(o => o.id === id) || null;
  },

  // 更新订单状态
  updateStatus(id: string, status: Order["status"]): void {
    const orders = this.getAll();
    const order = orders.find(o => o.id === id);
    if (order) {
      order.status = status;
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    }
  },

  // 按状态筛选
  getByStatus(status: Order["status"]): Order[] {
    return this.getAll().filter(o => o.status === status);
  },
};

// 运单管理
export const WaybillStorage = {
  // 获取所有运单
  getAll(): WaybillData[] {
    try {
      const data = localStorage.getItem(KEYS.WAYBILLS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // 保存运单
  save(waybill: WaybillData): void {
    const waybills = this.getAll();
    const index = waybills.findIndex(w => w.id === waybill.id);
    
    if (index >= 0) {
      waybills[index] = waybill;
    } else {
      waybills.unshift(waybill);
    }

    localStorage.setItem(KEYS.WAYBILLS, JSON.stringify(waybills));
  },

  // 根据订单ID获取运单
  getByOrderId(orderId: string): WaybillData | null {
    return this.getAll().find(w => w.orderId === orderId) || null;
  },

  // 更新运单状态
  updateStatus(id: string, status: WaybillData["status"], location?: string): void {
    const waybills = this.getAll();
    const waybill = waybills.find(w => w.id === id);
    if (waybill) {
      waybill.status = status;
      waybill.updatedAt = new Date().toISOString();
      
      // 添加时间线记录
      const statusMap: Record<WaybillData["status"], string> = {
        pending: "待发车",
        in_transit: "运输中",
        arrived: "已到达",
        signed: "已签收",
        completed: "已完成"
      };
      
      waybill.timeline.push({
        time: new Date().toLocaleString("zh-CN"),
        status: statusMap[status],
        description: `订单状态更新为${statusMap[status]}`,
        location
      });

      localStorage.setItem(KEYS.WAYBILLS, JSON.stringify(waybills));
    }
  },

  // 按状态筛选
  getByStatus(status: WaybillData["status"]): WaybillData[] {
    return this.getAll().filter(w => w.status === status);
  },
};

// 初始化示例数据（仅首次使用）
export const initializeDefaultData = () => {
  // 检查是否已有数据
  if (AddressStorage.getAll("sender").length === 0) {
    // 添加示例发货地址
    const senderAddresses: AddressData[] = [
      {
        id: "sender_1",
        name: "张三",
        phone: "13800138001",
        province: "广东省",
        city: "深圳市",
        district: "南山区",
        address: "科技园南区深南大道10000号",
        loadingNote: "东门进，3号月台",
        isDefault: true,
        type: "sender",
        createdAt: new Date().toISOString(),
        usedCount: 5
      }
    ];
    
    senderAddresses.forEach(addr => AddressStorage.save(addr));
  }

  if (AddressStorage.getAll("receiver").length === 0) {
    // 添加示例收货地址
    const receiverAddresses: AddressData[] = [
      {
        id: "receiver_1",
        name: "李四",
        phone: "13800138002",
        province: "广东省",
        city: "广州市",
        district: "天河区",
        address: "珠江新城花城大道88号",
        loadingNote: "货运专用通道",
        isDefault: true,
        type: "receiver",
        createdAt: new Date().toISOString(),
        usedCount: 3
      }
    ];
    
    receiverAddresses.forEach(addr => AddressStorage.save(addr));
  }
};
