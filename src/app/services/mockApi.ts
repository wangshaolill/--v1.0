// 货运宝4.0 - 模拟API服务

import {
  MOCK_ADDRESS_BOOK,
  MOCK_GPS_LOCATION,
  MOCK_PASTE_RECOGNITION,
  MOCK_IMAGE_OCR_RESULTS,
  MOCK_VOICE_RECOGNITION,
  MOCK_ORDERS,
  MOCK_QUOTES,
  MOCK_TRACKING_POINTS,
  MOCK_WAYBILL_TIMELINE,
  MOCK_DOCUMENTS,
  MOCK_PAYMENT_RECORDS,
  MOCK_USER_PROFILE,
  MOCK_RETURN_LOADS,
  type MockAddress,
  type MockMapLocation,
  type MockRecognitionResult,
  type MockOrder,
  type MockQuote,
  type MockTrackingPoint,
  type MockWaybillTimeline,
  type MockDocument,
  type MockPaymentRecord,
  type MockUserProfile,
  type MockReturnLoad,
} from "@/app/data/mockData";

// 模拟网络延迟
const delay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

// ========== 地址相关API ==========

/**
 * 获取常用地址簿
 */
export async function fetchAddressBook(): Promise<MockAddress[]> {
  await delay(600);
  return MOCK_ADDRESS_BOOK;
}

/**
 * 保存地址到地址簿
 */
export async function saveAddress(address: Omit<MockAddress, "id">): Promise<{ success: boolean; id: string }> {
  await delay(500);
  const newId = `addr_${Date.now()}`;
  console.log("📍 保存地址到地址簿:", { id: newId, ...address });
  return { success: true, id: newId };
}

/**
 * 删除地址
 */
export async function deleteAddress(id: string): Promise<{ success: boolean }> {
  await delay(400);
  console.log("🗑️ 删除地址:", id);
  return { success: true };
}

// ========== 地图相关API ==========

/**
 * GPS定位 - 获取当前位置
 */
export async function getCurrentLocation(): Promise<MockMapLocation> {
  await delay(1000);
  console.log("📍 GPS定位成功:", MOCK_GPS_LOCATION);
  return MOCK_GPS_LOCATION;
}

/**
 * 地图选点 - 根据用户点击地图返回位置信息
 */
export async function selectLocationOnMap(): Promise<MockMapLocation> {
  await delay(1200);
  const location: MockMapLocation = {
    lat: 22.5478,
    lng: 114.0875,
    address: "广东省深圳市福田区华强北路1002号",
    province: "广东省",
    city: "深圳市",
    district: "福田区",
    detailAddress: "华强北路1002号",
  };
  console.log("🗺️ 地图选点成功:", location);
  return location;
}

/**
 * 逆地理编码 - 根据坐标获取地址
 */
export async function reverseGeocode(lat: number, lng: number): Promise<MockMapLocation> {
  await delay(800);
  const location: MockMapLocation = {
    lat,
    lng,
    address: "广东省深圳市南山区科技园南区深南大道10000号",
    province: "广东省",
    city: "深圳市",
    district: "南山区",
    detailAddress: "科技园南区深南大道10000号",
  };
  console.log("🔄 逆地理编码成功:", location);
  return location;
}

// ========== 智能识别API ==========

/**
 * 粘贴识别 - 智能解析粘贴板内容
 */
export async function recognizePastedText(text: string): Promise<MockRecognitionResult> {
  await delay(1000);
  
  // 简单的智能识别逻辑
  const phoneMatch = text.match(/1[3-9]\d{9}/);
  const nameMatch = text.match(/[\u4e00-\u9fa5]{2,4}/);
  
  const result: MockRecognitionResult = {
    contact: nameMatch ? nameMatch[0] : MOCK_PASTE_RECOGNITION.contact,
    phone: phoneMatch ? phoneMatch[0] : MOCK_PASTE_RECOGNITION.phone,
    province: MOCK_PASTE_RECOGNITION.province,
    city: MOCK_PASTE_RECOGNITION.city,
    district: MOCK_PASTE_RECOGNITION.district,
    detailAddress: MOCK_PASTE_RECOGNITION.detailAddress,
    confidence: 0.92,
  };
  
  console.log("📋 粘贴识别成功:", result);
  return result;
}

/**
 * 图片OCR识别 - 识别图片中的地址信息
 */
export async function recognizeImageOCR(imageFile: File): Promise<MockRecognitionResult> {
  await delay(2000);
  const result = MOCK_IMAGE_OCR_RESULTS[0];
  console.log("🖼️ 图片OCR识别成功:", result);
  return result;
}

/**
 * 语音识别 - 将语音转为文字并识别地址
 */
export async function recognizeVoice(audioBlob: Blob): Promise<MockRecognitionResult> {
  await delay(2500);
  console.log("🎤 语音识别成功:", MOCK_VOICE_RECOGNITION);
  return MOCK_VOICE_RECOGNITION;
}

// ========== 订单相关API ==========

/**
 * 获取订单列表
 */
export async function fetchOrders(status?: string): Promise<MockOrder[]> {
  await delay(800);
  if (status && status !== "all") {
    return MOCK_ORDERS.filter(order => order.status === status);
  }
  return MOCK_ORDERS;
}

/**
 * 获取订单详情
 */
export async function fetchOrderDetail(orderId: string): Promise<MockOrder | null> {
  await delay(600);
  const order = MOCK_ORDERS.find(o => o.id === orderId);
  console.log("📦 获取订单详情:", order);
  return order || null;
}

/**
 * 创建订单
 */
export async function createOrder(orderData: Partial<MockOrder>): Promise<{ success: boolean; orderId: string }> {
  await delay(1000);
  const orderId = `order_${Date.now()}`;
  console.log("✨ 创建订单成功:", { orderId, ...orderData });
  return { success: true, orderId };
}

/**
 * 取消订单
 */
export async function cancelOrder(orderId: string): Promise<{ success: boolean }> {
  await delay(600);
  console.log("❌ 取消订单:", orderId);
  return { success: true };
}

// ========== 报价相关API ==========

/**
 * 获取订单的司机报价列表
 */
export async function fetchQuotes(orderId: string): Promise<MockQuote[]> {
  await delay(800);
  const quotes = MOCK_QUOTES.filter(q => q.orderId === orderId);
  console.log(`💰 获取订单 ${orderId} 的报价列表:`, quotes);
  return quotes;
}

/**
 * 接受报价
 */
export async function acceptQuote(quoteId: string): Promise<{ success: boolean }> {
  await delay(600);
  console.log("✅ 接受报价:", quoteId);
  return { success: true };
}

// ========== 运单跟踪API ==========

/**
 * 获取运单实时跟踪信息
 */
export async function fetchTrackingInfo(orderId: string): Promise<MockTrackingPoint[]> {
  await delay(1000);
  console.log("🚚 获取运单跟踪信息:", orderId);
  return MOCK_TRACKING_POINTS;
}

/**
 * 获取运单状态时间轴
 */
export async function fetchWaybillTimeline(orderId: string): Promise<MockWaybillTimeline[]> {
  await delay(700);
  console.log("📜 获取运单时间轴:", orderId);
  return MOCK_WAYBILL_TIMELINE;
}

// ========== 电子单据API ==========

/**
 * 获取订单相关单据
 */
export async function fetchDocuments(orderId: string): Promise<MockDocument[]> {
  await delay(600);
  console.log("📄 获取电子单据:", orderId);
  return MOCK_DOCUMENTS;
}

/**
 * 签署电子合同
 */
export async function signContract(documentId: string, signature: string): Promise<{ success: boolean }> {
  await delay(1000);
  console.log("✍️ 签署电子合同:", { documentId, signature });
  return { success: true };
}

/**
 * 上传回单图片
 */
export async function uploadPOD(orderId: string, images: File[]): Promise<{ success: boolean; urls: string[] }> {
  await delay(1500);
  const urls = images.map((_, index) => `https://example.com/pod/${orderId}_${index}.jpg`);
  console.log("📸 上传回单图片:", { orderId, urls });
  return { success: true, urls };
}

// ========== 支付相关API ==========

/**
 * 获取支付记录
 */
export async function fetchPaymentRecords(orderId: string): Promise<MockPaymentRecord[]> {
  await delay(600);
  const records = MOCK_PAYMENT_RECORDS.filter(p => p.orderId === orderId);
  console.log("💳 获取支付记录:", records);
  return records;
}

/**
 * 创建支付订单
 */
export async function createPayment(data: {
  orderId: string;
  amount: number;
  type: "deposit" | "balance" | "full";
  method: "wechat" | "alipay" | "bank";
}): Promise<{ success: boolean; paymentUrl: string; paymentId: string }> {
  await delay(1000);
  const paymentId = `pay_${Date.now()}`;
  const paymentUrl = `https://pay.example.com/${paymentId}`;
  console.log("💰 创建支付订单:", { paymentId, ...data });
  return { success: true, paymentUrl, paymentId };
}

/**
 * 查询支付状态
 */
export async function checkPaymentStatus(paymentId: string): Promise<{ status: "pending" | "success" | "failed" }> {
  await delay(800);
  console.log("🔍 查询支付状态:", paymentId);
  // 模拟支付成功
  return { status: "success" };
}

// ========== 用户相关API ==========

/**
 * 获取用户信息
 */
export async function fetchUserProfile(): Promise<MockUserProfile> {
  await delay(600);
  console.log("👤 获取用户信息:", MOCK_USER_PROFILE);
  return MOCK_USER_PROFILE;
}

/**
 * 更新用户信息
 */
export async function updateUserProfile(data: Partial<MockUserProfile>): Promise<{ success: boolean }> {
  await delay(800);
  console.log("✏️ 更新用户信息:", data);
  return { success: true };
}

// ========== 回程配货API ==========

/**
 * 获取回程配货推荐列表
 */
export async function fetchReturnLoads(params: {
  fromCity: string;
  toCity: string;
}): Promise<MockReturnLoad[]> {
  await delay(1000);
  console.log("🔄 获取回程配货:", params);
  return MOCK_RETURN_LOADS;
}

/**
 * 接受回程配货
 */
export async function acceptReturnLoad(loadId: string): Promise<{ success: boolean; orderId: string }> {
  await delay(800);
  const orderId = `order_${Date.now()}`;
  console.log("✅ 接受回程配货:", { loadId, orderId });
  return { success: true, orderId };
}

// ========== 评价相关API ==========

export interface MockRating {
  orderId: string;
  driverRating: number; // 1-5
  serviceRating: number; // 1-5
  timeRating: number; // 1-5
  comment?: string;
  tags?: string[]; // 标签，如"准时", "服务好"等
}

/**
 * 提交评价
 */
export async function submitRating(rating: MockRating): Promise<{ success: boolean }> {
  await delay(800);
  console.log("⭐ 提交评价:", rating);
  return { success: true };
}

// ========== 消息通知API ==========

export interface MockNotification {
  id: string;
  type: "order" | "payment" | "system";
  title: string;
  content: string;
  time: string;
  read: boolean;
}

/**
 * 获取消息通知列表
 */
export async function fetchNotifications(): Promise<MockNotification[]> {
  await delay(600);
  const notifications: MockNotification[] = [
    {
      id: "notif_1",
      type: "order",
      title: "订单已接单",
      content: "您的订单 YL202402260001 已被李师傅接单",
      time: "2024-02-26 09:00",
      read: false,
    },
    {
      id: "notif_2",
      type: "payment",
      title: "支付成功",
      content: "定金支付成功，金额：¥1,050",
      time: "2024-02-26 08:45",
      read: true,
    },
    {
      id: "notif_3",
      type: "system",
      title: "系统维护通知",
      content: "系统将于今晚22:00-23:00进行维护",
      time: "2024-02-25 18:00",
      read: true,
    },
  ];
  console.log("🔔 获取消息通知:", notifications);
  return notifications;
}