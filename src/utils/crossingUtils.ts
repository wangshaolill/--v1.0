/**
 * 琼州海峡过海工具函数
 */

import type { CrossingInfo, TrackingPoint } from "@/types/waybill";

// 琼州海峡两侧城市
const QIONGZHOU_CITIES = {
  MAINLAND: ["海口市", "海口", "湛江市", "湛江", "徐闻县", "徐闻"],  // 海南、广东沿海
  HAINAN: ["海口市", "海口", "三亚市", "三亚", "儋州市", "儋州", "琼海市", "琼海", "文昌市", "文昌"],
  GUANGDONG_COAST: ["湛江市", "湛江", "徐闻县", "徐闻"],
};

/**
 * 判断是否需要过琼州海峡
 * @param fromCity 出发城市
 * @param toCity 到达城市
 * @returns 是否需要过海
 */
export function needsCrossing(fromCity: string, toCity: string): boolean {
  const isFromHainan = QIONGZHOU_CITIES.HAINAN.some(city => fromCity.includes(city));
  const isToHainan = QIONGZHOU_CITIES.HAINAN.some(city => toCity.includes(city));
  const isFromMainland = QIONGZHOU_CITIES.GUANGDONG_COAST.some(city => fromCity.includes(city));
  const isToMainland = QIONGZHOU_CITIES.GUANGDONG_COAST.some(city => toCity.includes(city));

  // 从海南到大陆，或从大陆到海南
  return (isFromHainan && !isToHainan) || (!isFromHainan && isToHainan);
}

/**
 * 判断是从海南到大陆还是从大陆到海南
 */
export function getCrossingDirection(fromCity: string, toCity: string): "to_mainland" | "to_hainan" | null {
  const isFromHainan = QIONGZHOU_CITIES.HAINAN.some(city => fromCity.includes(city));
  const isToHainan = QIONGZHOU_CITIES.HAINAN.some(city => toCity.includes(city));

  if (isFromHainan && !isToHainan) {
    return "to_mainland";  // 从海南到大陆
  } else if (!isFromHainan && isToHainan) {
    return "to_hainan";    // 从大陆到海南
  }
  return null;
}

/**
 * 生成琼州海峡过海信息
 */
export function generateCrossingInfo(fromCity: string, toCity: string): CrossingInfo | undefined {
  if (!needsCrossing(fromCity, toCity)) {
    return undefined;
  }

  const direction = getCrossingDirection(fromCity, toCity);

  if (direction === "to_mainland") {
    // 从海南到大陆：海口港 → 海安新港
    return {
      isRequired: true,
      boardingPort: "海口港",
      arrivalPort: "海安新港",
    };
  } else if (direction === "to_hainan") {
    // 从大陆到海南：海安新港 → 海口港
    return {
      isRequired: true,
      boardingPort: "海安新港",
      arrivalPort: "海口港",
    };
  }

  return undefined;
}

/**
 * 生成完整的运单轨迹（包括过海节点）
 */
export function generateTrackingPoints(
  fromCity: string,
  toCity: string,
  createTime: string,
  driverName: string
): TrackingPoint[] {
  const points: TrackingPoint[] = [];

  // 1. 签约节点
  points.push({
    id: `track-contracted-${Date.now()}`,
    type: "contracted",
    time: createTime,
    location: fromCity,
    description: "运单已生成，待司机发货",
    operator: driverName,
  });

  // 如果需要过海，添加过海节点占位
  if (needsCrossing(fromCity, toCity)) {
    const direction = getCrossingDirection(fromCity, toCity);
    const crossingInfo = generateCrossingInfo(fromCity, toCity);

    if (crossingInfo) {
      // 预留过海节点（实际时间待司机确认）
      points.push({
        id: `track-crossing-boarding-${Date.now()}`,
        type: "crossing",
        time: "",  // 待更新
        location: crossingInfo.boardingPort,
        description: "等待登船",
        operator: driverName,
      });

      points.push({
        id: `track-crossing-sailing-${Date.now()}`,
        type: "crossing",
        time: "",  // 待更新
        location: "琼州海峡",
        description: "航行中",
        operator: driverName,
      });

      points.push({
        id: `track-crossing-arrived-${Date.now()}`,
        type: "crossing",
        time: "",  // 待更新
        location: crossingInfo.arrivalPort,
        description: "已下船，继续行驶",
        operator: driverName,
      });
    }
  }

  return points;
}

/**
 * 根据当前状态更新进度百分比
 */
export function calculateProgress(status: string, hasCrossing: boolean): number {
  if (!hasCrossing) {
    // 无过海：签约0% → 发货20% → 在途50% → 到达80% → 签收100%
    switch (status) {
      case "contracted": return 0;
      case "pickup_arrived": return 20;
      case "in_transit": return 50;
      case "delivery_arrived": return 80;
      case "signed": return 100;
      default: return 0;
    }
  } else {
    // 有过海：签约0% → 发货15% → 在途30% → 登船40% → 过海50% → 下船60% → 在途75% → 到达85% → 签收100%
    switch (status) {
      case "contracted": return 0;
      case "pickup_arrived": return 15;
      case "in_transit": return 30;
      case "crossing_boarding": return 40;
      case "crossing_sailing": return 50;
      case "crossing_arrived": return 60;
      case "delivery_arrived": return 85;
      case "signed": return 100;
      default: return 0;
    }
  }
}

/**
 * 获取下一个状态
 */
export function getNextStatus(currentStatus: string, hasCrossing: boolean): string | null {
  if (!hasCrossing) {
    // 无过海流程
    const flow = ["contracted", "pickup_arrived", "in_transit", "delivery_arrived", "signed"];
    const currentIndex = flow.indexOf(currentStatus);
    return currentIndex >= 0 && currentIndex < flow.length - 1 ? flow[currentIndex + 1] : null;
  } else {
    // 有过海流程
    const flow = [
      "contracted",
      "pickup_arrived",
      "in_transit",
      "crossing_boarding",
      "crossing_sailing",
      "crossing_arrived",
      "delivery_arrived",
      "signed"
    ];
    const currentIndex = flow.indexOf(currentStatus);
    return currentIndex >= 0 && currentIndex < flow.length - 1 ? flow[currentIndex + 1] : null;
  }
}

/**
 * 格式化预计航行时间（琼州海峡约1.5-2小时）
 */
export function estimateCrossingDuration(): string {
  return "约2小时";
}
