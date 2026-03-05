/**
 * 回程配货匹配工具
 * 用于根据收发货地址智能推荐回程配货车辆
 */

import type { ReturnCargoVehicle } from "@/app/components/ReturnCargoRecommendModal";

// 完整的回程配货数据（从FindVehicle组件提取）
export const ALL_RETURN_CARGOS: ReturnCargoVehicle[] = [
  {
    id: "hk001",
    route: "海口 → 广州",
    from: "海口",
    to: "广州",
    vehicleInfo: "6.8米厢式货车",
    capacity: "8吨",
    price: 2800,
    originalPrice: 3500,
    rating: 4.9,
    orderCount: 428,
    driverName: "王师傅",
    distance: "570公里",
    estimatedTime: "轮渡+陆运12小时",
    isVerified: true,
    discount: 20,
    tags: ["回程空车", "信用优选"],
    countdownMinutes: 185,
    cargoPreference: ["热带水果", "海产品", "日用百货"],
  },
  {
    id: "hk002",
    route: "海口 → 深圳",
    from: "海口",
    to: "深圳",
    vehicleInfo: "7.6米厢式货车",
    capacity: "10吨",
    price: 3200,
    originalPrice: 4200,
    rating: 5,
    orderCount: 567,
    driverName: "李师傅",
    distance: "620公里",
    estimatedTime: "轮渡+陆运13小时",
    isVerified: true,
    discount: 23.8,
    tags: ["回程空车", "立即出发"],
    cargoPreference: ["电子产品", "热带水果"],
  },
  {
    id: "hk003",
    route: "海口 → 湛江",
    from: "海口",
    to: "湛江",
    vehicleInfo: "4.2米厢式货车",
    capacity: "5吨",
    price: 680,
    originalPrice: 900,
    rating: 4.8,
    orderCount: 345,
    driverName: "张师傅",
    distance: "150公里",
    estimatedTime: "轮渡3小时",
    isVerified: true,
    discount: 24.4,
    tags: ["回程空车", "立即出发"],
    countdownMinutes: 125,
    cargoPreference: ["海鲜", "水果", "农副产品"],
  },
  {
    id: "hk004",
    route: "海口 → 南宁",
    from: "海口",
    to: "南宁",
    vehicleInfo: "5.2米厢式货车",
    capacity: "6吨",
    price: 1450,
    originalPrice: 1900,
    rating: 4.7,
    orderCount: 289,
    driverName: "陈师傅",
    distance: "420公里",
    estimatedTime: "轮渡+陆运9小时",
    isVerified: false,
    discount: 23.7,
    tags: ["回程空车"],
    cargoPreference: ["橡胶", "热带水果", "海产品"],
  },
  {
    id: "hk005",
    route: "海口 → 三亚",
    from: "海口",
    to: "三亚",
    vehicleInfo: "4.2米厢式货车",
    capacity: "5吨",
    price: 450,
    originalPrice: 650,
    rating: 4.9,
    orderCount: 512,
    driverName: "刘师傅",
    distance: "280公里",
    estimatedTime: "4小时",
    isVerified: true,
    discount: 30.8,
    tags: ["回程空车", "信用优选"],
    cargoPreference: ["旅游用品", "日用百货", "水果"],
  },
  {
    id: "hk006",
    route: "海口 → 北海",
    from: "海口",
    to: "北海",
    vehicleInfo: "5.2米厢式货车",
    capacity: "6吨",
    price: 1200,
    originalPrice: 1650,
    rating: 4.6,
    orderCount: 298,
    driverName: "赵师傅",
    distance: "320公里",
    estimatedTime: "轮渡+陆运7小时",
    isVerified: false,
    discount: 27.3,
    tags: ["回程空车", "立即出发"],
    cargoPreference: ["海产品", "水产养殖品"],
  },
  {
    id: "hk007",
    route: "海口 → 东莞",
    from: "海口",
    to: "东莞",
    vehicleInfo: "6.8米厢式货车",
    capacity: "8吨",
    price: 3050,
    originalPrice: 3900,
    rating: 4.8,
    orderCount: 356,
    driverName: "吴师傅",
    distance: "600公里",
    estimatedTime: "轮渡+陆运12.5小时",
    isVerified: true,
    discount: 21.8,
    tags: ["回程空车"],
    countdownMinutes: 165,
    cargoPreference: ["电子产品", "五金配件"],
  },
  {
    id: "hk008",
    route: "海口 → 佛山",
    from: "海口",
    to: "佛山",
    vehicleInfo: "7.6米厢式货车",
    capacity: "10吨",
    price: 2950,
    originalPrice: 3800,
    rating: 5,
    orderCount: 423,
    driverName: "周师傅",
    distance: "580公里",
    estimatedTime: "轮渡+陆运12小时",
    isVerified: true,
    discount: 22.4,
    tags: ["回程空车", "信用优选"],
    cargoPreference: ["陶瓷", "建材", "家具"],
  },
  {
    id: "hk009",
    route: "海口 → 上海",
    from: "海口",
    to: "上海",
    vehicleInfo: "9.6米厢式货车",
    capacity: "15吨",
    price: 6800,
    originalPrice: 8500,
    rating: 4.7,
    orderCount: 267,
    driverName: "郑师傅",
    distance: "2150公里",
    estimatedTime: "轮渡+陆运2天",
    isVerified: false,
    discount: 20,
    tags: ["回程空车", "立即出发"],
    cargoPreference: ["热带水果", "海产品", "橡胶"],
  },
  {
    id: "hk010",
    route: "海口 → 北京",
    from: "海口",
    to: "北京",
    vehicleInfo: "9.6米厢式货车",
    capacity: "15吨",
    price: 7500,
    originalPrice: 9500,
    rating: 4.8,
    orderCount: 234,
    driverName: "孙师傅",
    distance: "2850公里",
    estimatedTime: "轮渡+陆运3天",
    isVerified: false,
    discount: 21.1,
    tags: ["回程空车"],
    cargoPreference: ["热带水果", "海南特产"],
  },
  {
    id: "hk011",
    route: "海口 → 珠海",
    from: "海口",
    to: "珠海",
    vehicleInfo: "5.2米厢式货车",
    capacity: "6吨",
    price: 2650,
    originalPrice: 3400,
    rating: 4.9,
    orderCount: 445,
    driverName: "朱师傅",
    distance: "550公里",
    estimatedTime: "轮渡+陆运11小时",
    isVerified: true,
    discount: 22.1,
    tags: ["回程空车", "信用优选"],
    countdownMinutes: 95,
    cargoPreference: ["海产品", "日用百货"],
  },
  {
    id: "hk012",
    route: "海口 → 惠州",
    from: "海口",
    to: "惠州",
    vehicleInfo: "6.8米厢式货车",
    capacity: "8吨",
    price: 3100,
    originalPrice: 4000,
    rating: 4.7,
    orderCount: 289,
    driverName: "林师傅",
    distance: "630公里",
    estimatedTime: "轮渡+陆运13小时",
    isVerified: false,
    discount: 22.5,
    tags: ["回程空车", "立即出发"],
    cargoPreference: ["电子产品", "精密仪器", "水果"],
  },
  // 非海口路线
  {
    id: "sz001",
    route: "深圳 → 广州",
    from: "深圳",
    to: "广州",
    vehicleInfo: "4.2米厢式货车",
    capacity: "5吨",
    price: 350,
    originalPrice: 500,
    rating: 4.8,
    orderCount: 892,
    driverName: "陈师傅",
    distance: "120公里",
    estimatedTime: "2小时",
    isVerified: true,
    discount: 30,
    tags: ["回程空车", "立即出发"],
    cargoPreference: ["电子产品", "日用百货"],
  },
  {
    id: "gz001",
    route: "广州 → 深圳",
    from: "广州",
    to: "深圳",
    vehicleInfo: "4.2米厢式货车",
    capacity: "5吨",
    price: 380,
    originalPrice: 520,
    rating: 4.9,
    orderCount: 756,
    driverName: "黄师傅",
    distance: "120公里",
    estimatedTime: "2小时",
    isVerified: true,
    discount: 26.9,
    tags: ["回程空车", "信用优选"],
    cargoPreference: ["服装", "电子产品"],
  },
  {
    id: "bj001",
    route: "北京 → 天津",
    from: "北京",
    to: "天津",
    vehicleInfo: "4.2米厢式货车",
    capacity: "5吨",
    price: 280,
    originalPrice: 400,
    rating: 4.7,
    orderCount: 534,
    driverName: "李师傅",
    distance: "130公里",
    estimatedTime: "2.5小时",
    isVerified: true,
    discount: 30,
    tags: ["回程空车"],
    cargoPreference: ["建材", "日用品"],
  },
  {
    id: "sh001",
    route: "上海 → 杭州",
    from: "上海",
    to: "杭州",
    vehicleInfo: "5.2米厢式货车",
    capacity: "6吨",
    price: 450,
    originalPrice: 650,
    rating: 4.8,
    orderCount: 623,
    driverName: "张师傅",
    distance: "180公里",
    estimatedTime: "3小时",
    isVerified: true,
    discount: 30.8,
    tags: ["回程空车", "立即出发"],
    cargoPreference: ["电子产品", "服装"],
  },
];

/**
 * 城市名称归一化（提取核心城市名）
 * 例如："海南省海口市龙华区" -> "海口"
 */
export function normalizeCityName(cityString: string): string {
  if (!cityString) return "";
  
  // 提取城市名（去除省、市、区等后缀）
  const cityMatch = cityString.match(/([\u4e00-\u9fa5]+)市/);
  if (cityMatch) {
    return cityMatch[1];
  }
  
  // 如果没有"市"字，直接返回清理后的字符串
  return cityString.replace(/省|市|区|县|自治区|特别行政区/g, "").trim();
}

/**
 * 根据起点和终点城市匹配回程配货车辆
 * @param fromCity 起点城市（可以是完整地址）
 * @param toCity 终点城市（可以是完整地址）
 * @param options 匹配选项
 * @returns 匹配的回程配货车辆列表
 */
export function matchReturnCargos(
  fromCity: string,
  toCity: string,
  options?: {
    maxResults?: number; // 最多返回几条结果
    sortBy?: "price" | "discount" | "rating"; // 排序方式
  }
): ReturnCargoVehicle[] {
  const { maxResults = 5, sortBy = "discount" } = options || {};
  
  // 归一化城市名称
  const normalizedFrom = normalizeCityName(fromCity);
  const normalizedTo = normalizeCityName(toCity);
  
  if (!normalizedFrom || !normalizedTo) {
    return [];
  }
  
  // 精确匹配：起点和终点完全一致
  let matched = ALL_RETURN_CARGOS.filter(
    (cargo) => cargo.from === normalizedFrom && cargo.to === normalizedTo
  );
  
  // 如果没有精确匹配，尝试模糊匹配（起点或终点包含关键词）
  if (matched.length === 0) {
    matched = ALL_RETURN_CARGOS.filter(
      (cargo) =>
        cargo.from.includes(normalizedFrom) || normalizedFrom.includes(cargo.from) ||
        cargo.to.includes(normalizedTo) || normalizedTo.includes(cargo.to)
    );
  }
  
  // 排序
  if (sortBy === "price") {
    matched.sort((a, b) => a.price - b.price);
  } else if (sortBy === "discount") {
    matched.sort((a, b) => b.discount - a.discount); // 折扣高的排前面
  } else if (sortBy === "rating") {
    matched.sort((a, b) => b.rating - a.rating);
  }
  
  // 限制返回数量
  return matched.slice(0, maxResults);
}

/**
 * 检查是否应该显示回程配货推荐
 * @param fromCity 起点城市
 * @param toCity 终点城市
 * @returns 是否有可推荐的回程配货
 */
export function shouldShowReturnCargoRecommend(
  fromCity: string,
  toCity: string
): boolean {
  const matched = matchReturnCargos(fromCity, toCity, { maxResults: 1 });
  return matched.length > 0;
}
