import { useState, useEffect } from "react";
import { MapPin, Navigation, Phone, Clock, Package, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import type { Waybill } from "@/types/waybill";

interface RealTimeTrackingProps {
  waybill: Waybill;
  onCallDriver?: () => void;
}

interface LocationPoint {
  city: string;
  time: string;
  status: string;
  lat?: number;
  lng?: number;
}

export function RealTimeTracking({ waybill, onCallDriver }: RealTimeTrackingProps) {
  const [currentLocation, setCurrentLocation] = useState<string>("运输中...");
  const [progress, setProgress] = useState<number>(45);
  const [estimatedArrival, setEstimatedArrival] = useState<string>("预计2小时后到达");

  // 模拟实时位置更新
  useEffect(() => {
    const locations = [
      "杭州市萧山区",
      "杭州市滨江区",
      "杭州市江干区",
      "杭州市下城区",
      "德清县",
      "湖州市",
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < locations.length) {
        setCurrentLocation(locations[index]);
        setProgress(30 + (index / locations.length) * 60);
        const remainingHours = Math.max(1, 6 - index);
        setEstimatedArrival(`预计${remainingHours}小时后到达`);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 轨迹点数据
  const trackingPoints: LocationPoint[] = [
    {
      city: waybill.from,
      time: "2月6日 08:00",
      status: "已装货",
    },
    {
      city: "杭州市萧山区",
      time: "2月6日 08:45",
      status: "途经",
    },
    {
      city: "杭州市滨江区",
      time: "2月6日 09:30",
      status: "途经",
    },
    {
      city: currentLocation,
      time: "刚刚",
      status: "当前位置",
    },
  ];

  return (
    <div className="space-y-4">
      {/* 地图区域（模拟） */}
      <Card>
        <CardContent className="p-4">
          <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg h-48 overflow-hidden">
            {/* 简化的地图背景 */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 left-4 w-20 h-20 bg-blue-300 rounded-full blur-2xl" />
              <div className="absolute bottom-6 right-6 w-32 h-32 bg-green-300 rounded-full blur-3xl" />
            </div>

            {/* 路线 */}
            <svg className="absolute inset-0 w-full h-full">
              <path
                d="M 40 160 Q 80 120, 120 100 T 200 80 T 280 60"
                stroke="#FF6034"
                strokeWidth="3"
                fill="none"
                strokeDasharray="5,5"
                className="animate-pulse"
              />
            </svg>

            {/* 起点 */}
            <div className="absolute top-32 left-8">
              <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg" />
                <span className="absolute top-4 left-0 text-[10px] font-medium text-gray-700 whitespace-nowrap bg-white px-1.5 py-0.5 rounded shadow">
                  {waybill.from}
                </span>
              </div>
            </div>

            {/* 当前位置（动画） */}
            <div className="absolute top-12 right-16">
              <div className="relative animate-bounce">
                <div className="w-8 h-8 bg-[#FF6034] rounded-full flex items-center justify-center shadow-lg">
                  <Navigation className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              </div>
            </div>

            {/* 终点 */}
            <div className="absolute top-10 right-6">
              <div className="relative">
                <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg" />
                <span className="absolute top-4 right-0 text-[10px] font-medium text-gray-700 whitespace-nowrap bg-white px-1.5 py-0.5 rounded shadow">
                  {waybill.to}
                </span>
              </div>
            </div>

            {/* 当前位置提示 */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-gray-700">实时位置</span>
              </div>
            </div>
          </div>

          {/* 位置信息 */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF6034]" />
                <span className="text-sm font-medium">当前位置</span>
              </div>
              <span className="text-sm text-gray-600">{currentLocation}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">预计到达</span>
              </div>
              <span className="text-sm text-gray-600">{estimatedArrival}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">运输进度</span>
              </div>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* 进度条 */}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#FF6034] to-[#FF8C66] h-full transition-all duration-1000 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 快捷操作 */}
          <div className="mt-4 flex gap-2">
            <Button
              onClick={onCallDriver}
              className="flex-1 bg-gradient-to-r from-[#FF6034] to-[#FF8C66] hover:opacity-90"
            >
              <Phone className="w-4 h-4 mr-2" />
              呼叫司机
            </Button>
            <Button variant="outline" className="flex-1">
              <Package className="w-4 h-4 mr-2" />
              查看货物
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 物流轨迹 */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[#FF6034]" />
            物流轨迹
          </h3>

          <div className="space-y-3">
            {trackingPoints.map((point, index) => (
              <div key={index} className="flex gap-3">
                {/* 时间线 */}
                <div className="flex flex-col items-center">
                  {point.status === "当前位置" ? (
                    <div className="w-3 h-3 bg-[#FF6034] rounded-full border-2 border-white shadow-lg animate-pulse" />
                  ) : point.status === "已装货" ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  ) : (
                    <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  )}
                  {index < trackingPoints.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-200" />
                  )}
                </div>

                {/* 内容 */}
                <div className="flex-1 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{point.city}</span>
                    {point.status === "当前位置" && (
                      <Badge className="bg-[#FF6034] text-white text-[10px] h-4 px-1.5">
                        实时
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{point.time}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-600">{point.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 提示信息 */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <div className="text-xs text-blue-700 leading-relaxed">
          <p className="font-medium mb-1">实时位置更新说明</p>
          <p className="text-blue-600">
            位置信息每5分钟自动更新，如需最新位置请刷新页面或直接联系司机确认
          </p>
        </div>
      </div>
    </div>
  );
}
