import { useState } from "react";
import { Package, Search, X, Phone, MapPin, AlertTriangle, CheckCircle, Circle, ChevronLeft, Truck, Bell, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Progress } from "@/app/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { toast } from "sonner";
import { Toaster } from "@/app/components/ui/sonner";
import { DispatchWaybillModal } from "@/app/components/DispatchWaybillModal";
import { WaybillDetailModal } from "@/app/components/WaybillDetailModal";
import { DispatchNoteModal } from "@/app/components/DispatchNoteModal";
import { DeleteConfirmDialog } from "@/app/components/DeleteConfirmDialog";
import { DeliveryConfirmModal } from "@/app/components/DeliveryConfirmModal";
import { PODModal } from "@/app/components/PODModal";
import { PickupConfirmModal } from "@/app/components/PickupConfirmModal";
import { SwipeableCard } from "@/app/components/SwipeableCard";
import { PullToRefresh } from "@/app/components/PullToRefresh";
import { TOAST_MESSAGES, WAYBILL_STATUS_CONFIG } from "@/config/constants";
import type { Waybill } from "@/types/waybill";

interface DeliveryConfirmData {
  recipientName: string;
  recipientPhone: string;
  signatureImage?: string;
  proofImages?: string[];
  receivedTime: string;
  notes?: string;
}

interface PickupConfirmData {
  senderName: string;
  senderPhone: string;
  signatureImage?: string;
  proofImages?: string[];
  pickupTime: string;
  notes?: string;
}

interface TrackingPoint {
  location: string;
  time: string;
  status: string;
  completed: boolean;
  isException?: boolean;
}

interface WaybillsProps {
  waybills: Waybill[];
  onDispatchRequest?: (waybills: Waybill[]) => void;
  onDeleteWaybill?: (waybillId: string) => void;
  onUpdateWaybill?: (waybillId: string, updates: Partial<Waybill>) => void;  // 新增
}

export function Waybills({ waybills, onDispatchRequest, onDeleteWaybill, onUpdateWaybill }: WaybillsProps) {
  const [selectedWaybill, setSelectedWaybill] = useState<Waybill | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showPODModal, setShowPODModal] = useState(false);
  const [deliveryData, setDeliveryData] = useState<DeliveryConfirmData | null>(null);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showDispatchNoteModal, setShowDispatchNoteModal] = useState(false);
  const [pickupData, setPickupData] = useState<PickupConfirmData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [waybillToDelete, setWaybillToDelete] = useState<Waybill | null>(null);

  // 使用统一的状态配置
  const statusConfig = WAYBILL_STATUS_CONFIG;

  // 处理删除运单
  const handleDeleteClick = (waybill: Waybill, e: React.MouseEvent) => {
    e.stopPropagation();
    setWaybillToDelete(waybill);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (waybillToDelete && onDeleteWaybill) {
      onDeleteWaybill(waybillToDelete.id);
      toast.success("删除成功", {
        description: `运单 ${waybillToDelete.waybillNumber} 已删除`,
      });
    }
  };

  const trackingPoints: TrackingPoint[] = [
    {
      location: "北京市朝阳区",
      time: "2026-02-01 08:30",
      status: "货物已装车发出",
      completed: true,
    },
    {
      location: "石家庄市中转站",
      time: "2026-02-01 14:20",
      status: "经过中转站",
      completed: true,
    },
    {
      location: "济南市历下区服务区",
      time: "2026-02-02 10:15",
      status: "当前位置",
      completed: true,
    },
    {
      location: "南京市玄武区中转站",
      time: "预计 2026-02-03 08:00",
      status: "预计到达",
      completed: false,
    },
    {
      location: "上海市浦东新区",
      time: "预计 2026-02-03 18:00",
      status: "预计送达目的地",
      completed: false,
    },
  ];

  // 搜索过滤
  const filterWaybills = (status?: string) => {
    let filtered = status 
      ? waybills.filter((w) => w.status === status)
      : waybills;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((w) =>
        w.waybillNumber.toLowerCase().includes(query) ||
        w.orderNumber.toLowerCase().includes(query) ||
        w.cargoType.toLowerCase().includes(query) ||
        w.driverName.toLowerCase().includes(query) ||
        w.vehicleNumber.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  // 渲染运单列表
  const renderWaybillList = (status?: string) => {
    const filtered = filterWaybills(status);

    if (filtered.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Package className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-400 text-sm">
            {searchQuery ? "没有找到相关运单" : "暂无运单"}
          </p>
        </div>
      );
    }

    // 不再分组，直接渲染所有运单
    return (
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-3">
          {/* 渲染所有运单 */}
          {filtered.map((waybill) => (
            <SwipeableCard
              key={waybill.id}
              onDelete={(e: React.MouseEvent) => handleDeleteClick(waybill, e)}
            >
              <WaybillCard waybill={waybill} />
            </SwipeableCard>
          ))}
        </div>
      </PullToRefresh>
    );
  };

  const WaybillCard = ({ waybill }: { waybill: Waybill }) => {
    const config = statusConfig[waybill.status] || statusConfig['in_transit']; // Fallback to 'in_transit' if status not found

    const handleQuickCall = (e: React.MouseEvent) => {
      e.stopPropagation();
      const phoneNumber = waybill.driverPhone.replace(/\*/g, '0');
      window.location.href = `tel:${phoneNumber}`;
      toast.success("正在呼叫", {
        description: `呼叫 ${waybill.driverName}`,
      });
    };

    const handleCardClick = () => {
      setSelectedWaybill(waybill);
      setShowDetailModal(true);
    };
    
    const handleQuickDelivery = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedWaybill(waybill);
      setShowDeliveryModal(true);
    };

    return (
      <Card 
        className="hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer active:scale-[0.98]"
        onClick={handleCardClick}
      >
        <CardContent className="p-0">
          {/* 顶部路线栏 - 货主最关心的信息 */}
          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className="text-xs text-gray-700 font-medium truncate">
                {waybill.fromCity}{waybill.fromDistrict}{waybill.fromStreet}
              </span>
              <div className="flex items-center gap-0.5 shrink-0">
                <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                <div className="w-1 h-1 rounded-full bg-gray-400"></div>
              </div>
              <span className="text-xs text-gray-700 font-medium truncate">
                {waybill.toCity}{waybill.toDistrict}{waybill.toStreet}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <Badge className={`${config.color} text-white text-xs px-2 py-0.5`}>
                {config.label}
              </Badge>
              {/* 呼叫按钮 - 小图标 */}
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:bg-blue-100"
                onClick={handleQuickCall}
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
              </Button>
            </div>
          </div>

          {/* 主体内容区 */}
          <div className="p-3">
            {/* 货物信息 */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-sm text-gray-900">
                    {waybill.cargoType} · {waybill.weight}吨
                  </h3>
                  {/* 🆕 多车标识 */}
                  {waybill.totalVehicles && waybill.totalVehicles > 1 && waybill.vehicleIndex && (
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                      {waybill.vehicleIndex}/{waybill.totalVehicles}号车
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500">运单号 {waybill.waybillNumber}</p>
              </div>
            </div>

            {/* 异常提示 - 最高优先级 */}
            {waybill.status === "exception" && waybill.exceptionReason && (
              <div className="bg-red-50 border border-red-300 rounded-md px-2.5 py-2 mb-2">
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-red-800 mb-0.5">运输异常</p>
                    <p className="text-xs text-red-700 line-clamp-2">{waybill.exceptionReason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 物流状态 - 核心信息 */}
            <div className={`rounded-md px-2.5 py-2 ${
              waybill.status === "exception" 
                ? "bg-red-50 border border-red-200" 
                : waybill.status === "signed"
                ? "bg-gray-50 border border-gray-200"
                : "bg-blue-50 border border-blue-200"
            }`}>
              {/* 当前位置 */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <MapPin className={`w-3.5 h-3.5 ${
                  waybill.status === "exception" ? "text-red-600" : 
                  waybill.status === "signed" ? "text-gray-600" : "text-blue-600"
                }`} />
                <span className={`text-xs font-medium ${
                  waybill.status === "exception" ? "text-red-800" : 
                  waybill.status === "signed" ? "text-gray-700" : "text-blue-800"
                }`}>
                  {waybill.status === "signed" ? "已送达" : waybill.currentLocation}
                </span>
              </div>

              {/* 进度条 + 预计到达 */}
              {waybill.status !== "signed" && (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <Progress 
                      value={waybill.progress} 
                      className={`h-1.5 flex-1 ${
                        waybill.status === "exception" ? "[&>div]:bg-red-500" : ""
                      }`}
                    />
                    <span className={`text-[10px] font-bold ${
                      waybill.status === "exception" ? "text-red-700" : "text-blue-700"
                    }`}>
                      {waybill.progress}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={waybill.status === "exception" ? "text-red-600" : "text-gray-500"}>
                      {waybill.departureTime.split(' ')[1]}出发
                    </span>
                    <span className={`font-bold ${
                      waybill.status === "exception" ? "text-red-700" : "text-blue-700"
                    }`}>
                      预计 {waybill.estimatedArrival.split(' ')[1]}
                    </span>
                  </div>
                </>
              )}

              {/* 已签收时显示签收时间 */}
              {waybill.status === "signed" && (
                <div className="text-[10px] text-gray-600">
                  签收时间：{waybill.estimatedArrival}
                </div>
              )}
            </div>

            {/* 付款方式标签 - 简化 */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded ${
                waybill.paymentMethod === "prepaid" 
                  ? "bg-blue-100 text-blue-700" 
                  : "bg-orange-100 text-orange-700"
              }`}>
                {waybill.paymentMethod === "prepaid" ? "寄付" : "到付"}
              </span>
              {waybill.contractNumber && (
                <span className="text-[10px] text-gray-400">
                  合同 {waybill.contractNumber}
                </span>
              )}
            </div>
          </div>
        </CardContent>
        
        {/* 🎯 行动按钮区域 - 根据状态显示（P0优化）*/}
        
        {waybill.status === 'delivery_arrived' && (
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-t-2 border-orange-300 p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-orange-600 animate-pulse" />
              <p className="text-xs font-bold text-orange-900">
                货物已到达收货点，请尽快确认收货
              </p>
            </div>
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 text-sm"
              onClick={handleQuickDelivery}
            >
              ✅ 立即确认收货
            </Button>
          </div>
        )}
        
        {/* 异常状态行动按钮 */}
        {waybill.status === 'exception' && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-t-2 border-red-400 p-3">
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickCall(e);
                }}
              >
                <Phone className="w-3.5 h-3.5 mr-1" />
                致电司机
              </Button>
              <Button 
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2"
                onClick={(e) => {
                  e.stopPropagation();
                  toast.info("正在连接客服", {
                    description: "客服将在1分钟内联系您"
                  });
                }}
              >
                联系客服
              </Button>
            </div>
          </div>
        )}
      </Card>
    );
  };

  const TrackingDetail = ({ waybill }: { waybill: Waybill }) => {
    const [arrivalNotification, setArrivalNotification] = useState(true);
    const config = statusConfig[waybill.status] || statusConfig['in_transit']; // Fallback to 'in_transit' if status not found

    const handleCallDriver = () => {
      const phoneNumber = waybill.driverPhone.replace(/\\*/g, '0');
      window.location.href = `tel:${phoneNumber}`;
      toast.success("正在呼叫", {
        description: `呼叫 ${waybill.driverName}`,
      });
    };

    const toggleNotification = () => {
      setArrivalNotification(!arrivalNotification);
      toast.success(
        arrivalNotification ? "已关闭到货提醒" : "已开启到货提醒",
        {
          description: arrivalNotification 
            ? "将不再提醒您货物到达信息" 
            : "货物到达时将通过短信和推送通知您",
        }
      );
    };

    return (
      <div className="h-full overflow-y-auto bg-gray-50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Toaster />
        
        {/* 顶部导航 */}
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedWaybill(null)}
              className="shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-base">物流跟踪</h2>
              <p className="text-xs text-muted-foreground truncate">{waybill.waybillNumber}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <Card className="border-2">
            <CardContent className="pt-4 pb-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold mb-1">{waybill.cargoType}</h3>
                  <p className="text-xs text-muted-foreground">订单号：{waybill.orderNumber}</p>
                </div>
                <Badge className={`${config.color} text-white`}>
                  {config.label}
                </Badge>
              </div>

              {/* 异常提示 */}
              {waybill.status === "exception" && waybill.exceptionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-800">运输异常</p>
                      <p className="text-sm text-red-700 mt-1">{waybill.exceptionReason}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full bg-red-500 hover:bg-red-600"
                    onClick={handleCallDriver}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    联系司机了解情况
                  </Button>
                </div>
              )}

              {/* 运输进度 */}
              {waybill.status !== "signed" && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-blue-900">运输进度</span>
                    <span className="text-sm font-medium text-blue-900">{waybill.progress}%</span>
                  </div>
                  <Progress 
                    value={waybill.progress} 
                    className={`h-2 mb-2 ${waybill.status === "exception" ? "[&>div]:bg-red-500" : ""}`}
                  />
                  <div className="flex justify-between text-xs text-blue-700">
                    <span>出发：{waybill.departureTime}</span>
                    <span>预计：{waybill.estimatedArrival}</span>
                  </div>
                </div>
              )}

              {/* 当前位置 */}
              {waybill.status !== "signed" && (
                <div className={`border rounded-lg p-3 mb-4 ${
                  waybill.status === "exception" 
                    ? "bg-red-50 border-red-200" 
                    : "bg-gradient-to-r from-green-50 to-blue-50 border-green-200"
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className={`w-4 h-4 ${waybill.status === "exception" ? "text-red-600" : "text-green-600"}`} />
                    <span className={`text-sm font-medium ${waybill.status === "exception" ? "text-red-900" : "text-green-900"}`}>
                      当前位置
                    </span>
                  </div>
                  <p className={`text-sm ml-6 ${waybill.status === "exception" ? "text-red-800" : "text-green-800"}`}>
                    {waybill.currentLocation}
                  </p>
                </div>
              )}

              {/* 司机信息卡片 */}
              <div className="bg-white border-2 border-blue-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Truck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-base">{waybill.driverName}</p>
                      <p className="text-sm text-muted-foreground">{waybill.vehicleNumber}</p>
                      <p className="text-sm text-muted-foreground">{waybill.driverPhone}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                    onClick={handleCallDriver}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    呼叫司机
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      toast.info("短信功能", {
                        description: "正在打短信应用...",
                      });
                    }}
                  >
                    发送短信
                  </Button>
                </div>
              </div>

              {/* 到货提醒开关 */}
              {waybill.status !== "signed" && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium text-orange-900">到货提醒</p>
                        <p className="text-xs text-orange-700">货物到达时通知您</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={arrivalNotification ? "default" : "outline"}
                      onClick={toggleNotification}
                      className={arrivalNotification ? "bg-orange-500 hover:bg-orange-600" : ""}
                    >
                      {arrivalNotification ? "已开启" : "已关闭"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 物流轨迹 */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                物流轨迹
              </h4>
              <div className="relative space-y-4">
                {trackingPoints.map((point, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      {point.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                      )}
                      {index < trackingPoints.length - 1 && (
                        <div
                          className={`w-0.5 h-12 mt-2 ${
                            point.completed ? "bg-green-500" : "bg-muted-foreground/30"
                          }`}
                        ></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex justify-between items-start mb-1">
                        <h5 className={`font-medium ${point.completed ? "text-gray-900" : "text-muted-foreground"}`}>
                          {point.location}
                        </h5>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{point.time.replace('预计 ', '')}</span>
                      </div>
                      <p className={`text-sm ${point.completed ? "text-gray-600" : "text-muted-foreground"}`}>
                        {point.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setSelectedWaybill(null)}
          >
            返回运单列表
          </Button>
        </div>
      </div>
    );
  };

  // 下拉刷新处理
  const handleRefresh = async () => {
    // 模拟刷新延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("刷新成", { description: "运单信息已更新" });
  };

  // 确认收货处理
  const handleConfirmDelivery = (waybillId: string) => {
    const waybill = waybills.find(w => w.id === waybillId);
    if (waybill) {
      setSelectedWaybill(waybill);
      setShowDetailModal(false);
      setShowDeliveryModal(true);
    }
  };

  // 收货确认完成
  const handleDeliveryConfirmed = (data: DeliveryConfirmData) => {
    if (!selectedWaybill || !onUpdateWaybill) return;
    
    // 1. 保存收货数据
    setDeliveryData(data);
    
    // 2. 更新运单状态：delivery_arrived → signed
    onUpdateWaybill(selectedWaybill.id, {
      status: "signed",
      progress: 100,  // 完成100%
      signedTime: new Date().toLocaleString(),
    });
    
    // 3. 关闭弹窗
    setShowDeliveryModal(false);
    
    // 4. 显示成功提示
    toast.success("收货确认成功", {
      description: "运单已完成，电子回单已生成",
    });
    
    // 5. 自动打开电子回单
    setTimeout(() => {
      setShowPODModal(true);
    }, 500);
  };

  // 查看电子回单
  const handleViewPOD = (waybillId: string) => {
    const waybill = waybills.find(w => w.id === waybillId);
    if (waybill) {
      setSelectedWaybill(waybill);
      setShowDetailModal(false);
      setShowPODModal(true);
    }
  };

  // 确认发货处理
  const handleConfirmPickup = (waybillId: string) => {
    const waybill = waybills.find(w => w.id === waybillId);
    if (waybill) {
      setSelectedWaybill(waybill);
      setShowDetailModal(false);
      setShowPickupModal(true);
    }
  };

  // 发货确认完成
  const handlePickupConfirmed = (data: PickupConfirmData) => {
    if (!selectedWaybill || !onUpdateWaybill) return;
    
    // 1. 保存发货数据
    setPickupData(data);
    
    // 2. 更新运单状态：pickup_arrived → in_transit
    onUpdateWaybill(selectedWaybill.id, {
      status: "in_transit",
      currentLocation: `从${selectedWaybill.fromCity}发出`,
      progress: 10,  // 初始进度10%
    });
    
    // 3. 关闭弹窗
    setShowPickupModal(false);
    
    // 4. 显示成功提示
    toast.success("发货确认成功", {
      description: "货物已装车发出，开始运输",
    });
    
    // 5. 自动打开电子出货单
    setTimeout(() => {
      setShowDispatchNoteModal(true);
    }, 500);
  };

  // 查看电子出货单
  const handleViewDispatchNote = (waybillId: string) => {
    const waybill = waybills.find(w => w.id === waybillId);
    if (waybill) {
      setSelectedWaybill(waybill);
      setShowDetailModal(false);
      setShowDispatchNoteModal(true);
    }
  };

  if (selectedWaybill) {
    return <TrackingDetail waybill={selectedWaybill} />;
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      <Toaster />
      
      {/* 运单详情弹窗 */}
      {showDetailModal && selectedWaybill && (
        <WaybillDetailModal
          waybill={selectedWaybill}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedWaybill(null);
          }}
          onConfirmDelivery={handleConfirmDelivery}
          onViewPOD={handleViewPOD}
          onConfirmPickup={handleConfirmPickup}
          onViewDispatchNote={handleViewDispatchNote}
        />
      )}

      {/* 收货确认弹窗 */}
      {showDeliveryModal && selectedWaybill && (
        <DeliveryConfirmModal
          waybill={selectedWaybill}
          onClose={() => {
            setShowDeliveryModal(false);
          }}
          onConfirm={handleDeliveryConfirmed}
        />
      )}

      {/* 电子回单弹窗 */}
      {showPODModal && selectedWaybill && (
        <PODModal
          waybill={selectedWaybill}
          deliveryData={deliveryData || undefined}
          onClose={() => {
            setShowPODModal(false);
            setSelectedWaybill(null);
            setDeliveryData(null);
          }}
        />
      )}

      {/* 发货确认弹窗 */}
      {showPickupModal && selectedWaybill && (
        <PickupConfirmModal
          waybill={selectedWaybill}
          onClose={() => {
            setShowPickupModal(false);
          }}
          onConfirm={handlePickupConfirmed}
        />
      )}

      {/* 电子出货单弹窗 */}
      {showDispatchNoteModal && selectedWaybill && (
        <DispatchNoteModal
          waybill={selectedWaybill}
          pickupData={pickupData || undefined}
          onClose={() => {
            setShowDispatchNoteModal(false);
            setSelectedWaybill(null);
            setPickupData(null);
          }}
        />
      )}

      {/* 删除确认弹窗 */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="确认删除运单"
        description="删除后运单数据将无法恢复，确定要删除这个运单吗？"
        itemName={waybillToDelete?.waybillNumber || ""}
      />

      {/* 搜索栏 */}
      <div className="shrink-0 bg-white border-b px-4 pt-3 pb-2">
        {showSearch ? (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索运单号、货物、司机..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 h-9"
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");
              }}
            >
              取消
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-base">运单管理</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowSearch(true)}
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* 标签栏 - 双行布局 */}
      <div className="shrink-0 bg-white shadow-sm">
        <Tabs defaultValue="all" className="w-full">
          <div className="px-4 pb-2">
            <TabsList className="grid w-full grid-cols-3 h-auto gap-0.5 bg-gray-100 p-0.5">
              <TabsTrigger value="all" className="text-xs font-medium py-1">全部</TabsTrigger>
              <TabsTrigger value="pickup_arrived" className="text-xs font-medium py-1">发货</TabsTrigger>
              <TabsTrigger value="in_transit" className="text-xs font-medium py-1">在途</TabsTrigger>
              <TabsTrigger value="delivery_arrived" className="text-xs font-medium py-1">卸货</TabsTrigger>
              <TabsTrigger value="signed" className="text-xs font-medium py-1">签收</TabsTrigger>
              <TabsTrigger value="exception" className="text-xs font-medium py-1">异常</TabsTrigger>
            </TabsList>
          </div>

          <div className="h-[calc(100vh-180px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <TabsContent value="all" className="px-4 py-3 mt-0">
              {renderWaybillList()}
            </TabsContent>
            <TabsContent value="pickup_arrived" className="px-4 py-3 mt-0">
              {renderWaybillList("pickup_arrived")}
            </TabsContent>
            <TabsContent value="in_transit" className="px-4 py-3 mt-0">
              {renderWaybillList("in_transit")}
            </TabsContent>
            <TabsContent value="delivery_arrived" className="px-4 py-3 mt-0">
              {renderWaybillList("delivery_arrived")}
            </TabsContent>
            <TabsContent value="signed" className="px-4 py-3 mt-0">
              {renderWaybillList("signed")}
            </TabsContent>
            <TabsContent value="exception" className="px-4 py-3 mt-0">
              {renderWaybillList("exception")}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}