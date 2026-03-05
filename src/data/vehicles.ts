// 车型信息数据库
export interface VehicleInfo {
  id: string;
  name: string;           // 车型名称
  type: string;           // 车辆类型
  length: number;         // 长度(米)
  width: number;          // 宽度(米)
  height: number;         // 高度(米)
  capacity: number;       // 载重(吨)
  volume: number;         // 容积(立方米)
  icon: string;           // 图标emoji
}

export const VEHICLE_TYPES: VehicleInfo[] = [
  {
    id: "van_4_2",
    name: "4.2米厢式货车",
    type: "厢式货车",
    length: 4.2,
    width: 1.9,
    height: 1.8,
    capacity: 2,
    volume: 14.4,
    icon: "🚐",
  },
  {
    id: "van_5_2",
    name: "5.2米厢式货车",
    type: "厢式货车",
    length: 5.2,
    width: 2.0,
    height: 2.0,
    capacity: 5,
    volume: 20.8,
    icon: "🚚",
  },
  {
    id: "van_6_8",
    name: "6.8米厢式货车",
    type: "厢式货车",
    length: 6.8,
    width: 2.3,
    height: 2.4,
    capacity: 8,
    volume: 37.6,
    icon: "🚛",
  },
  {
    id: "van_7_6",
    name: "7.6米厢式货车",
    type: "厢式货车",
    length: 7.6,
    width: 2.4,
    height: 2.5,
    capacity: 10,
    volume: 45.6,
    icon: "🚛",
  },
  {
    id: "van_9_6",
    name: "9.6米厢式货车",
    type: "厢式货车",
    length: 9.6,
    width: 2.4,
    height: 2.7,
    capacity: 15,
    volume: 62.2,
    icon: "🚛",
  },
  {
    id: "stake_13",
    name: "13米高栏车",
    type: "高栏车",
    length: 13,
    width: 2.4,
    height: 2.8,
    capacity: 30,
    volume: 87.4,
    icon: "🚚",
  },
  {
    id: "flatbed_17_5",
    name: "17.5米平板车",
    type: "平板车",
    length: 17.5,
    width: 3.0,
    height: 3.0,
    capacity: 35,
    volume: 157.5,
    icon: "🚛",
  },
];

// 根据ID获取车型信息
export const getVehicleById = (id: string): VehicleInfo | undefined => {
  return VEHICLE_TYPES.find(v => v.id === id);
};

// 根据名称获取车型信息
export const getVehicleByName = (name: string): VehicleInfo | undefined => {
  return VEHICLE_TYPES.find(v => v.name === name);
};
