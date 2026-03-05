import { useState } from "react";
import { 
  X, MapPin, Truck, Package, Clock, Phone, Navigation, 
  AlertCircle, CheckCircle, Camera, FileText, Star,
  Cloud, Thermometer, Wind, ThumbsUp, MessageSquare,
  Shield, Bell, Users, Calendar
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { Progress } from "@/app/components/ui/progress";
import { RealTimeTracking } from "./RealTimeTracking";
import type { Waybill } from "@/types/waybill";

interface TrackingPoint {
  time: string;
  location: string;
  status: string;
  completed: boolean;
  isException?: boolean;
  temperature?: number;
  weather?: string;
  note?: string;
  photos?: string[];
}

interface WaybillDetailModalProps {
  waybill: Waybill;
  onClose: () => void;
  onConfirmDelivery?: (waybillId: string) => void;
  onViewPOD?: (waybillId: string) => void;
  onConfirmPickup?: (waybillId: string) => void;
  onViewDispatchNote?: (waybillId: string) => void;
}

export function WaybillDetailModal({ 
  waybill, 
  onClose,
  onConfirmDelivery,
  onViewPOD,
  onConfirmPickup,
  onViewDispatchNote
}: WaybillDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"tracking" | "info" | "care">("tracking");

  // 模拟物流轨迹数据
  const trackingPoints: TrackingPoint[] = [
    {
      time: "2026-02-05 08:30",
      location: `${waybill.fromCity}${waybill.fromDistrict}`,
      status: "司机已到达装货点",
      completed: true,
      weather: "晴",
      temperature: 15,
      note: "装货点联系人：张先生 138****1234",
      photos: ["装货点照片"]
    },
    {
      time: "2026-02-05 09:45",
      location: `${waybill.fromCity}${waybill.fromDistrict}`,
      status: "货物装车完成，开始运输",
      completed: true,
      note: "货物状态良好，已拍照留存",
      photos: ["货物照片1", "货物照片2"]
    },
    {
      time: "2026-02-05 14:20",
      location: "途经河北省石家庄市",
      status: "正常行驶中",
      completed: true,
      weather: "多云",
      temperature: 12,
    },
    {
      time: "2026-02-05 18:30",
      location: "当前位置：山东省济南市",
      status: "运输中，一切正常",
      completed: true,
      weather: "晴",
      temperature: 10,
      note: "司机已休息，明日继续"
    },
    {
      time: "预计 2026-02-06 10:00",
      location: `${waybill.toCity}${waybill.toDistrict}`,
      status: "预计到达卸货点",
      completed: false,
      note: "将提前30分钟通知收货人"
    },
  ];

  // 根据状态判断是否可以确认收货
  const canConfirmDelivery = waybill.status === "delivery_arrived";
  const canConfirmPickup = waybill.status === "pickup_arrived";
  const isCompleted = waybill.status === "signed";
  const isInTransit = waybill.status === "in_transit";

  // 天气和路况信息
  const weatherInfo = {
    current: "晴转多云",
    temperature: "10°C",
    wind: "东北风3级",
    suggestion: "天气良好，适合运输"
  };

  // 关怀提醒
  const careReminders = [
    {
      icon: Bell,
      title: "到货提醒",
      content: "司机距离卸货点还有约50公里，预计2小时后到达",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Thermometer,
      title: "温度适宜",
      content: "当前温度10°C，货物运输环境良好",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Shield,
      title: "货物保险",
      content: "本单已投保货运险，最高赔付50万元",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Phone,
      title: "24小时客服",
      content: "如有问题，可随时联系客服：400-123-4567",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  // 收货准备清单
  const deliveryChecklist = [
    { label: "收货人准备好", checked: false },
    { label: "卸货场地已清理", checked: false },
    { label: "卸货工具已准备", checked: false },
    { label: "验货清单已打印", checked: false },
  ];

  const handleCallDriver = () => {
    // 模拟拨打电话
    window.location.href = `tel:${waybill.driverPhone}`;
  };

  const handleNavigate = () => {
    // 模拟导航
    alert("正在打开地图导航...");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 animate-in fade-in duration-200">
      <div className="absolute inset-x-0 bottom-0 max-h-[90vh] bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* 头部 */}
        <div className="sticky top-0 bg-gradient-to-r from-[#FF6034] to-[#FF8A5C] px-5 py-4 rounded-t-3xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-white">运单详情</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* 运单号和状态 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/80 text-xs">运单号</span>
              <Badge className="bg-white text-[#FF6034] font-bold">
                {waybill.status === "signed" ? "已签收" :
                 waybill.status === "delivery_arrived" ? "待收货" :
                 waybill.status === "in_transit" ? "运输中" :
                 waybill.status === "pickup_arrived" ? "装货中" : "异常"}
              </Badge>
            </div>
            <p className="text-white font-mono text-sm">{waybill.waybillNumber}</p>
          </div>
        </div>

        {/* Tab切换 */}
        <div className="sticky top-[120px] bg-white border-b px-5 py-2 flex gap-6">
          <button
            onClick={() => setActiveTab("tracking")}
            className={`pb-2 text-sm font-medium transition-colors relative ${
              activeTab === "tracking" 
                ? "text-[#FF6034]" 
                : "text-gray-500"
            }`}
          >
            物流轨迹
            {activeTab === "tracking" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6034]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("info")}
            className={`pb-2 text-sm font-medium transition-colors relative ${
              activeTab === "info" 
                ? "text-[#FF6034]" 
                : "text-gray-500"
            }`}
          >
            运单信息
            {activeTab === "info" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6034]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("care")}
            className={`pb-2 text-sm font-medium transition-colors relative ${
              activeTab === "care" 
                ? "text-[#FF6034]" 
                : "text-gray-500"
            }`}
          >
            贴心服务
            {activeTab === "care" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6034]"></div>
            )}
          </button>
        </div>

        {/* 内容区域 */}
        <div className="overflow-y-auto px-5 pb-24 max-h-[calc(90vh-240px)]">
          {/* 物流轨迹 */}
          {activeTab === "tracking" && (
            <div className="py-4 space-y-4">
              {/* 实时物流跟踪 */}
              {isInTransit && (
                <RealTimeTracking 
                  waybill={waybill} 
                  onCallDriver={handleCallDriver}
                />
              )}

              {/* 进度条 */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">运输进度</span>
                  <span className="text-lg font-bold text-[#FF6034]">{waybill.progress}%</span>
                </div>
                <Progress value={waybill.progress} className="h-2" />
                <p className="text-xs text-gray-500 mt-2">
                  预计 2026-02-06 10:00 送达
                </p>
              </div>

              {/* 当前位置 */}
              <div className="bg-white border-2 border-[#FF6034] rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#FF6034] rounded-full flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">当前位置</h4>
                    <p className="text-sm text-gray-700 mb-2">{waybill.currentLocation}</p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-700 border-0">
                        <Clock className="w-3 h-3 mr-1" />
                        运输中
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-700 border-0">
                        <Thermometer className="w-3 h-3 mr-1" />
                        10°C
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* 时间轴 */}
              <div className="space-y-0">
                {trackingPoints.map((point, index) => (
                  <div key={index} className="relative flex gap-3">
                    {/* 时间线 */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        point.completed 
                          ? point.isException 
                            ? "bg-red-500" 
                            : "bg-green-500"
                          : "bg-gray-300"
                      }`}>
                        {point.completed ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : (
                          <Clock className="w-4 h-4 text-white" />
                        )}
                      </div>
                      {index < trackingPoints.length - 1 && (
                        <div className={`w-0.5 h-full min-h-[60px] ${
                          point.completed ? "bg-green-200" : "bg-gray-200"
                        }`}></div>
                      )}
                    </div>

                    {/* 内容 */}
                    <div className={`flex-1 pb-6 ${!point.completed && "opacity-60"}`}>
                      <div className="text-xs text-gray-500 mb-1">{point.time}</div>
                      <div className="font-medium text-gray-900 mb-1">{point.status}</div>
                      <div className="text-sm text-gray-600 mb-1">{point.location}</div>
                      
                      {point.note && (
                        <div className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1 mt-1">
                          💡 {point.note}
                        </div>
                      )}
                      
                      {point.weather && (
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Cloud className="w-3 h-3" />
                            {point.weather}
                          </span>
                          {point.temperature && (
                            <span className="flex items-center gap-1">
                              <Thermometer className="w-3 h-3" />
                              {point.temperature}°C
                            </span>
                          )}
                        </div>
                      )}
                      
                      {point.photos && point.photos.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {point.photos.map((photo, i) => (
                            <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Camera className="w-6 h-6 text-gray-400" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 运单信息 */}
          {activeTab === "info" && (
            <div className="py-4 space-y-4">
              {/* 路线信息 */}
              <div className="bg-white border rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF6034]" />
                  运输路线
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-0.5">发货地</div>
                      <div className="text-sm font-medium text-gray-900">
                        {waybill.fromCity}{waybill.fromDistrict}{waybill.fromStreet}
                      </div>
                    </div>
                  </div>
                  <div className="ml-3 border-l-2 border-dashed border-gray-300 h-6"></div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-3 h-3 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-0.5">收货地</div>
                      <div className="text-sm font-medium text-gray-900">
                        {waybill.toCity}{waybill.toDistrict}{waybill.toStreet}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 货物信息 */}
              <div className="bg-white border rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#FF6034]" />
                  货物信息
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">货物类型</div>
                    <div className="text-sm font-medium text-gray-900">{waybill.cargoType}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">货物重量</div>
                    <div className="text-sm font-medium text-gray-900">{waybill.weight}吨</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">付款方式</div>
                    <div className="text-sm font-medium text-gray-900">
                      {waybill.paymentMethod === "prepaid" ? "寄付" : "到付"}
                    </div>
                  </div>
                  {waybill.amount && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">运费金额</div>
                      <div className="text-sm font-medium text-[#FF6034]">¥{waybill.amount}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* 司机信息 */}
              <div className="bg-white border rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#FF6034]" />
                  司机信息
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">司机姓名</div>
                      <div className="text-sm font-medium text-gray-900">{waybill.driverName}</div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#FF6034] hover:bg-[#FF6034]/90"
                      onClick={handleCallDriver}
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      致电司机
                    </Button>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">车牌号</div>
                      <div className="text-sm font-medium text-gray-900">{waybill.vehicleNumber}</div>
                    </div>
                    {waybill.vehicleType && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">车辆类型</div>
                        <div className="text-sm font-medium text-gray-900">{waybill.vehicleType}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 时间信息 */}
              <div className="bg-white border rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF6034]" />
                  时间信息
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">发车时间</span>
                    <span className="font-medium text-gray-900">{waybill.departureTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">预计到达</span>
                    <span className="font-medium text-[#FF6034]">{waybill.estimatedArrival}</span>
                  </div>
                  {waybill.signedTime && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">签收时间</span>
                      <span className="font-medium text-green-600">{waybill.signedTime}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 贴心服务 */}
          {activeTab === "care" && (
            <div className="py-4 space-y-4">
              {/* 关怀提醒 */}
              <div className="space-y-3">
                {careReminders.map((reminder, index) => {
                  const Icon = reminder.icon;
                  return (
                    <div key={index} className={`${reminder.bgColor} border-2 border-${reminder.color.replace('text-', '')} rounded-xl p-4`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 ${reminder.color.replace('text-', 'bg-').replace('600', '500')} rounded-full flex items-center justify-center shrink-0`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">{reminder.title}</h4>
                          <p className="text-sm text-gray-600">{reminder.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 收货准备清单 */}
              {!isCompleted && (
                <div className="bg-white border rounded-xl p-4">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#FF6034]" />
                    收货准备清单
                  </h4>
                  <div className="space-y-2">
                    {deliveryChecklist.map((item, index) => (
                      <label key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={item.checked}
                          className="w-4 h-4 text-[#FF6034] rounded"
                        />
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* 天气路况 */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-blue-600" />
                  天气路况
                </h4>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-2xl mb-1">☀️</div>
                    <div className="text-xs text-gray-600">{weatherInfo.current}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{weatherInfo.temperature}</div>
                    <div className="text-xs text-gray-600">当前温度</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-900 font-medium mb-1">
                      <Wind className="w-4 h-4 inline mr-1" />
                    </div>
                    <div className="text-xs text-gray-600">{weatherInfo.wind}</div>
                  </div>
                </div>
                <div className="text-xs text-green-700 bg-green-50 rounded px-2 py-1 text-center">
                  ✓ {weatherInfo.suggestion}
                </div>
              </div>

              {/* 服务保障 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  服务保障
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>货物保价，安全无忧</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>全程GPS定位追踪</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>24小时客服在线</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>异常情况实时通知</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t px-5 py-3 flex gap-3">
          {isCompleted ? (
            <>
              <Button
                variant="outline"
                className="flex-1 border-[#FF6034] text-[#FF6034] hover:bg-[#FF6034]/5"
                onClick={() => onViewPOD && onViewPOD(waybill.id)}
              >
                <FileText className="w-4 h-4 mr-2" />
                查看回单
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-[#FF6034] to-[#FF8A5C]">
                <Star className="w-4 h-4 mr-2" />
                评价服务
              </Button>
            </>
          ) : canConfirmDelivery ? (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCallDriver}
              >
                <Phone className="w-4 h-4 mr-2" />
                联系司机
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600"
                onClick={() => onConfirmDelivery && onConfirmDelivery(waybill.id)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                确认收货
              </Button>
            </>
          ) : canConfirmPickup ? (
            <>
              <Button
                variant="outline"
                className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={() => onViewDispatchNote && onViewDispatchNote(waybill.id)}
              >
                <FileText className="w-4 h-4 mr-2" />
                查看出货单
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600"
                onClick={() => onConfirmPickup && onConfirmPickup(waybill.id)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                确认发货
              </Button>
            </>
          ) : isInTransit ? (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCallDriver}
              >
                <Phone className="w-4 h-4 mr-2" />
                联系司机
              </Button>
              <Button
                className="flex-1 bg-[#FF6034] hover:bg-[#FF6034]/90"
                onClick={handleNavigate}
              >
                <Navigation className="w-4 h-4 mr-2" />
                实时追踪
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCallDriver}
              >
                <Phone className="w-4 h-4 mr-2" />
                联系司机
              </Button>
              <Button
                className="flex-1 bg-[#FF6034] hover:bg-[#FF6034]/90"
                onClick={handleNavigate}
              >
                <Navigation className="w-4 h-4 mr-2" />
                实时追踪
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}