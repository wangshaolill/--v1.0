// 货运宝4.0 - 回程配货下单组件
// 货主从司机发布的固定回程路线直接下单，无需竞价

import { useState } from "react";
import { X, MapPin, Truck, DollarSign, User, Phone, Package, FileText, CheckCircle, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Badge } from "@/app/components/ui/badge";
import { AddressInputModal } from "@/app/components/AddressInputModal";
import { SmartTimePickerPage } from "@/app/components/SmartTimePickerPage";
import { toast } from "sonner";

// 回程配货信息
export interface ReturnCargoInfo {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverRating: number;
  driverOrderCount: number;
  vehicleNumber: string;
  vehicleType: string; // 如 "4.2米厢式货车"
  vehicleLength: string; // 如 "4.2米"
  vehicleStyle: string; // 如 "厢式"
  fromCity: string; // 如 "深圳市"
  toCity: string; // 如 "广州市"
  price: number; // 固定价格
  distance: string; // 如 "120km"
  estimatedTime: string; // 如 "2小时"
  availableDate: string; // 可用日期
}

interface ReturnCargoOrderProps {
  cargoInfo: ReturnCargoInfo;
  onClose: () => void;
  onSubmit: (orderData: any) => void;
}

// 包装方式选项
const PACKAGE_TYPES = ["纸箱", "托盘", "木架", "编织袋", "桶装", "裸装", "其他"];

// 货类明细选项（与QuickOrderV3保持一致）
const CARGO_TYPES = ["建筑材料", "电子产品", "日用品", "食品饮料", "机械设备", "化工原料", "农副产品", "钢材"];

// 附加要求选项
const SPECIAL_REQUIREMENTS = ["全程高速", "需要雨布", "带尾板", "有禁区", "签回单", "需装货", "需卸货", "压车", "送货入仓"];

export function ReturnCargoOrder({ cargoInfo, onClose, onSubmit }: ReturnCargoOrderProps) {
  // 地址信息（城市已锁定）
  const [pickupProvince, setPickupProvince] = useState("");
  const [pickupCity] = useState(cargoInfo.fromCity); // 锁定
  const [pickupDistrict, setPickupDistrict] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupLoadingNote, setPickupLoadingNote] = useState(""); // 装卸点说明
  const [pickupContact, setPickupContact] = useState("");
  const [pickupPhone, setPickupPhone] = useState("");

  const [deliveryProvince, setDeliveryProvince] = useState("");
  const [deliveryCity] = useState(cargoInfo.toCity); // 锁定
  const [deliveryDistrict, setDeliveryDistrict] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryLoadingNote, setDeliveryLoadingNote] = useState(""); // 装卸点说明
  const [deliveryContact, setDeliveryContact] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");

  // 货物信息
  const [cargoName, setCargoName] = useState("");
  const [showCargoDropdown, setShowCargoDropdown] = useState(false);
  const [packageTypes, setPackageTypes] = useState<string[]>([]);
  
  // 重量/体积范围
  const [weightMin, setWeightMin] = useState("");
  const [weightMax, setWeightMax] = useState("");
  const [volumeMin, setVolumeMin] = useState("");
  const [volumeMax, setVolumeMax] = useState("");
  
  const [cargoWeight, setCargoWeight] = useState("");
  const [cargoVolume, setCargoVolume] = useState("");
  const [cargoValue, setCargoValue] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState<string[]>([]); // 附加要求（改为数组）

  // 取货时间
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [pickupTimeRange, setPickupTimeRange] = useState(""); // 时间段
  const [pickupTimeNegotiable, setPickupTimeNegotiable] = useState(false); // 是否可协商

  // 地址输入弹窗
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [addressInputType, setAddressInputType] = useState<"sender" | "receiver">("sender");
  
  // 货物信息二级页面
  const [showCargoDetailsPage, setShowCargoDetailsPage] = useState(false);
  const [isCargoInfoCompleted, setIsCargoInfoCompleted] = useState(false); // 标记货物信息是否已完成
  
  // 智能时间选择器二级页面
  const [showTimePickerPage, setShowTimePickerPage] = useState(false);

  // 切换包装类型
  const togglePackageType = (type: string) => {
    setPackageTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  // 切换附加要求
  const toggleSpecialRequirement = (req: string) => {
    setSpecialRequirements(prev =>
      prev.includes(req)
        ? prev.filter(r => r !== req)
        : [...prev, req]
    );
  };

  // 打开地址输入
  const handleOpenAddressInput = (type: "sender" | "receiver") => {
    setAddressInputType(type);
    setShowAddressInput(true);
  };

  // 保存地址
  const handleSaveAddress = (data: {
    contact: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    address: string;
    loadingNote?: string;
  }) => {
    if (addressInputType === "sender") {
      setPickupProvince(data.province);
      setPickupDistrict(data.district);
      setPickupAddress(data.address);
      setPickupLoadingNote(data.loadingNote || "");
      setPickupContact(data.contact);
      setPickupPhone(data.phone);
    } else {
      setDeliveryProvince(data.province);
      setDeliveryDistrict(data.district);
      setDeliveryAddress(data.address);
      setDeliveryLoadingNote(data.loadingNote || "");
      setDeliveryContact(data.contact);
      setDeliveryPhone(data.phone);
    }
    setShowAddressInput(false);
  };

  // 保存货物信息
  const handleSaveCargoInfo = () => {
    // 验证货物信息
    if (!cargoName) {
      toast.error("请选择货物类型");
      return;
    }
    if (!weightMin && !weightMax && !volumeMin && !volumeMax) {
      toast.error("请填写货物重量或体积");
      return;
    }
    if (!pickupDate || !pickupTime) {
      toast.error("请选择取货时间");
      return;
    }

    // 标记为已完成
    setIsCargoInfoCompleted(true);
    setShowCargoDetailsPage(false);
    toast.success("货物信息已保存");
  };

  // 生成货物信息摘要
  const getCargoSummary = () => {
    const parts: string[] = [];
    
    if (cargoName) parts.push(cargoName);
    if (packageTypes.length > 0) parts.push(packageTypes.join("、"));
    
    if (weightMin && weightMax) {
      parts.push(`${weightMin}-${weightMax}吨`);
    } else if (weightMin) {
      parts.push(`${weightMin}吨`);
    } else if (weightMax) {
      parts.push(`${weightMax}吨`);
    }
    
    if (volumeMin && volumeMax) {
      parts.push(`${volumeMin}-${volumeMax}方`);
    } else if (volumeMin) {
      parts.push(`${volumeMin}方`);
    } else if (volumeMax) {
      parts.push(`${volumeMax}方`);
    }
    
    return parts.length > 0 ? parts.join("，") : "请填写";
  };

  // 生成取货时间摘要
  const getPickupTimeSummary = () => {
    if (pickupDate && pickupTime) {
      return `${pickupDate} ${pickupTime}`;
    }
    return "请选择";
  };

  // 提交订单
  const handleSubmit = () => {
    // 验证必填字段
    if (!pickupAddress || !pickupContact || !pickupPhone) {
      toast.error("请填写完整的发货地址信息");
      return;
    }
    if (!deliveryAddress || !deliveryContact || !deliveryPhone) {
      toast.error("请填写完整的收货地址信息");
      return;
    }
    if (!isCargoInfoCompleted) {
      toast.error("请填写货物信息和取货时间");
      return;
    }

    // 构建订单数据
    const orderData = {
      type: "return_cargo", // 标记为回程配货订单
      cargoInfo,
      pickup: {
        province: pickupProvince,
        city: pickupCity,
        district: pickupDistrict,
        address: pickupAddress,
        loadingNote: pickupLoadingNote,
        contact: pickupContact,
        phone: pickupPhone,
      },
      delivery: {
        province: deliveryProvince,
        city: deliveryCity,
        district: deliveryDistrict,
        address: deliveryAddress,
        loadingNote: deliveryLoadingNote,
        contact: deliveryContact,
        phone: deliveryPhone,
      },
      cargo: {
        name: cargoName,
        packageTypes,
        weightRange: weightMin || weightMax ? `${weightMin || ''}-${weightMax || ''}` : '',
        volumeRange: volumeMin || volumeMax ? `${volumeMin || ''}-${volumeMax || ''}` : '',
        value: cargoValue,
        specialRequirements,
      },
      pickupTime: `${pickupDate} ${pickupTime}`,
      price: cargoInfo.price,
      vehicleCount: 1, // 固定1辆车
      status: "confirmed", // 直接确认，无需等待报价
    };

    onSubmit(orderData);
    toast.success("下单成功", {
      description: `订单已确认，司机${cargoInfo.driverName}将按时取货`,
    });
  };

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 主内容 */}
      <div className="fixed inset-x-0 top-0 bottom-0 z-50 flex flex-col bg-white">
        {/* 顶部导航栏 */}
        <div className="shrink-0 bg-white border-b px-4 py-2 flex items-center justify-between">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
          <h1 className="text-base font-bold text-gray-900">回程配货下单</h1>
          <div className="w-8" />
        </div>

        {/* 内容区域 - 隐藏滚动条 */}
        <div className="flex-1 overflow-y-auto bg-gray-50 pb-20 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* 司机和车辆信息卡片 */}
          <Card className="m-3 border-2 border-[#FF6034]">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-11 h-11 bg-[#FF6034] rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className="font-bold text-base">{cargoInfo.driverName}</h3>
                      <div className="flex items-center gap-0.5 bg-yellow-50 px-1.5 py-0.5 rounded">
                        <span className="text-yellow-500 text-xs">⭐</span>
                        <span className="text-xs font-medium text-gray-700">{cargoInfo.driverRating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      已完成 {cargoInfo.driverOrderCount} 单
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 text-xs">回程空车</Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500 min-w-[2.5rem]">车型：</span>
                  <span className="font-medium text-gray-900">{cargoInfo.vehicleType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500 min-w-[2.5rem]">车牌：</span>
                  <span className="font-medium text-gray-900">{cargoInfo.vehicleNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500 min-w-[2.5rem]">路线：</span>
                  <span className="font-medium text-gray-900">
                    {cargoInfo.fromCity} → {cargoInfo.toCity}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500 min-w-[2.5rem]">价格：</span>
                  <span className="font-bold text-[#FF6034] text-lg">
                    ¥{cargoInfo.price}
                  </span>
                  <span className="text-xs text-gray-400">（固定价格）</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 发货地址 */}
          <Card className="mx-3 mb-3">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-white" />
                  </div>
                  <h3 className="font-bold text-sm">发货地址</h3>
                  <Badge variant="outline" className="text-xs py-0 h-5">
                    {pickupCity}
                  </Badge>
                </div>
              </div>

              {pickupAddress ? (
                <div
                  className="bg-gray-50 rounded-lg p-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleOpenAddressInput("sender")}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm">{pickupContact}</span>
                        <span className="text-xs text-gray-600">{pickupPhone}</span>
                      </div>
                      <p className="text-xs text-gray-700">
                        {pickupProvince} {pickupCity} {pickupDistrict}
                      </p>
                      <p className="text-xs text-gray-700">{pickupAddress}</p>
                      {pickupLoadingNote && (
                        <p className="text-xs text-orange-600 mt-0.5">
                          装卸说明：{pickupLoadingNote}
                        </p>
                      )}
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full border-dashed h-9 text-sm"
                  onClick={() => handleOpenAddressInput("sender")}
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  填写详细发货地址
                </Button>
              )}
            </CardContent>
          </Card>

          {/* 收货地址 */}
          <Card className="mx-3 mb-3">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[#FF6034] rounded-full flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-white" />
                  </div>
                  <h3 className="font-bold text-sm">收货地址</h3>
                  <Badge variant="outline" className="text-xs py-0 h-5">
                    {deliveryCity}
                  </Badge>
                </div>
              </div>

              {deliveryAddress ? (
                <div
                  className="bg-gray-50 rounded-lg p-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleOpenAddressInput("receiver")}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm">{deliveryContact}</span>
                        <span className="text-xs text-gray-600">{deliveryPhone}</span>
                      </div>
                      <p className="text-xs text-gray-700">
                        {deliveryProvince} {deliveryCity} {deliveryDistrict}
                      </p>
                      <p className="text-xs text-gray-700">{deliveryAddress}</p>
                      {deliveryLoadingNote && (
                        <p className="text-xs text-orange-600 mt-0.5">
                          装卸说明：{deliveryLoadingNote}
                        </p>
                      )}
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full border-dashed h-9 text-sm"
                  onClick={() => handleOpenAddressInput("receiver")}
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  填写详细收货地址
                </Button>
              )}
            </CardContent>
          </Card>

          {/* 货物信息 - 点击进入二级页面 */}
          <button
            onClick={() => setShowCargoDetailsPage(true)}
            className="mx-3 mb-3 w-[calc(100%-1.5rem)]"
          >
            <Card className={`transition-all ${isCargoInfoCompleted ? "border-green-500 border-2" : ""}`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#FF6034]" />
                    <div className="text-left">
                      <h3 className="font-bold text-sm mb-0.5">货物信息</h3>
                      <p className={`text-xs ${isCargoInfoCompleted ? "text-gray-700" : "text-gray-400"}`}>
                        {isCargoInfoCompleted ? getCargoSummary() : "请填写货物信息和取货时间"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isCargoInfoCompleted && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </button>

          {/* 温馨提示 */}
          <div className="mx-3 mb-3 bg-orange-50 border border-orange-200 rounded-lg p-2.5">
            <p className="text-xs text-orange-700 leading-relaxed">
              💡 <span className="font-medium">温馨提示：</span>回程配货价格固定，下单即确认 • 司机将按时取货 • 限1辆车
            </p>
          </div>
        </div>

        {/* 底部提交按钮 */}
        <div className="shrink-0 bg-white border-t px-4 py-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600">运费合计：</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-[#FF6034]">
                ¥{cargoInfo.price}
              </span>
              <span className="text-xs text-gray-400">（固定）</span>
            </div>
          </div>
          <Button
            className="w-full h-11 bg-[#FF6034] hover:bg-[#FF6034]/90 text-white font-bold text-base shadow-md"
            onClick={handleSubmit}
          >
            确认下单
          </Button>
        </div>
      </div>

      {/* 地址输入弹窗 */}
      {showAddressInput && (
        <AddressInputModal
          type={addressInputType}
          isOpen={showAddressInput}
          lockCity={true} // 城市已锁定
          initialData={
            addressInputType === "sender"
              ? {
                  contact: pickupContact,
                  phone: pickupPhone,
                  province: pickupProvince,
                  city: pickupCity,
                  district: pickupDistrict,
                  address: pickupAddress,
                  loadingNote: pickupLoadingNote,
                }
              : {
                  contact: deliveryContact,
                  phone: deliveryPhone,
                  province: deliveryProvince,
                  city: deliveryCity,
                  district: deliveryDistrict,
                  address: deliveryAddress,
                  loadingNote: deliveryLoadingNote,
                }
          }
          onClose={() => setShowAddressInput(false)}
          onSave={handleSaveAddress}
        />
      )}

      {/* 货物信息二级页面 */}
      {showCargoDetailsPage && (
        <div className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm">
          <div className="fixed inset-x-0 top-0 bottom-0 z-[60] flex flex-col bg-white">
            {/* 顶部导航栏 */}
            <div className="shrink-0 bg-white border-b px-4 py-3 flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setShowCargoDetailsPage(false)}
              >
                <X className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-bold text-gray-900">货物信息</h1>
              <div className="w-9" />
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto bg-gray-50 pb-24">
              {/* 货物信息 */}
              <Card className="mx-3 mt-3 mb-2">
                <CardContent className="p-2.5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Package className="w-4 h-4 text-[#FF6034]" />
                    <h3 className="font-bold text-sm">货物详情</h3>
                  </div>

                  <div className="space-y-1.5">
                    {/* 货物类型 */}
                    <Card className="p-2 relative">
                      <button
                        onClick={() => setShowCargoDropdown(!showCargoDropdown)}
                        className="w-full flex items-center justify-between"
                      >
                        <span className="text-xs text-gray-600">
                          货物类型 <span className="text-red-500">*</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-sm font-medium ${
                              cargoName ? "text-gray-900" : "text-gray-400"
                            }`}
                          >
                            {cargoName || "请选择"}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>

                      {/* 下拉菜单 */}
                      {showCargoDropdown && (
                        <>
                          <div
                            className="fixed inset-0 z-50"
                            onClick={() => setShowCargoDropdown(false)}
                          />
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto">
                            {CARGO_TYPES.map((type) => (
                              <button
                                key={type}
                                onClick={() => {
                                  setCargoName(type);
                                  setShowCargoDropdown(false);
                                }}
                                className={`w-full px-3 py-1.5 text-sm text-left hover:bg-gray-50 transition-colors ${
                                  cargoName === type ? "bg-orange-50 text-[#FF6034] font-medium" : "text-gray-900"
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </Card>

                    {/* 包装方式 */}
                    <Card className="p-2">
                      <div className="text-xs text-gray-600 mb-1">包装方式</div>
                      <div className="flex flex-wrap gap-1">
                        {PACKAGE_TYPES.map((type) => (
                          <button
                            key={type}
                            onClick={() => togglePackageType(type)}
                            className={`px-2 py-0.5 rounded-full border-2 text-xs font-medium transition-colors ${
                              packageTypes.includes(type)
                                ? "border-[#FF6034] text-[#FF6034] bg-orange-50"
                                : "border-gray-300 text-gray-600"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </Card>

                    {/* 重量/体积 - 范围输入 */}
                    <Card className="p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">
                          总重量/体积（选填一项） <span className="text-red-500">*</span>
                        </span>
                      </div>

                      {/* 重量范围 */}
                      <div className="mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm w-12 ${
                              volumeMin || volumeMax ? "text-gray-400" : "text-gray-900"
                            }`}
                          >
                            重量
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            value={weightMin}
                            onChange={(e) => {
                              setWeightMin(e.target.value);
                              setVolumeMin("");
                              setVolumeMax("");
                            }}
                            disabled={!!(volumeMin || volumeMax)}
                            placeholder="0-999"
                            className="flex-1 text-center bg-gray-50 h-7 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <span className="text-gray-400">—</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={weightMax}
                            onChange={(e) => {
                              setWeightMax(e.target.value);
                              setVolumeMin("");
                              setVolumeMax("");
                            }}
                            disabled={!!(volumeMin || volumeMax)}
                            placeholder="0-999"
                            className="flex-1 text-center bg-gray-50 h-7 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <span
                            className={`text-xs w-8 ${
                              volumeMin || volumeMax ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            吨
                          </span>
                        </div>
                      </div>

                      {/* 体积范围 */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm w-12 ${
                              weightMin || weightMax ? "text-gray-400" : "text-gray-900"
                            }`}
                          >
                            体积
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            value={volumeMin}
                            onChange={(e) => {
                              setVolumeMin(e.target.value);
                              setWeightMin("");
                              setWeightMax("");
                            }}
                            disabled={!!(weightMin || weightMax)}
                            placeholder="0-999"
                            className="flex-1 text-center bg-gray-50 h-7 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <span className="text-gray-400">—</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={volumeMax}
                            onChange={(e) => {
                              setVolumeMax(e.target.value);
                              setWeightMin("");
                              setWeightMax("");
                            }}
                            disabled={!!(weightMin || weightMax)}
                            placeholder="0-999"
                            className="flex-1 text-center bg-gray-50 h-7 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <span
                            className={`text-xs w-8 ${
                              weightMin || weightMax ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            方
                          </span>
                        </div>
                      </div>
                    </Card>

                    {/* 附加要求 */}
                    <Card className="p-2">
                      <div className="text-xs text-gray-600 mb-1">附加要求</div>
                      <div className="flex flex-wrap gap-1">
                        {SPECIAL_REQUIREMENTS.map((req) => (
                          <button
                            key={req}
                            onClick={() => toggleSpecialRequirement(req)}
                            className={`px-2 py-0.5 rounded-full border-2 text-xs font-medium transition-colors ${
                              specialRequirements.includes(req)
                                ? "border-[#FF6034] text-[#FF6034] bg-orange-50"
                                : "border-gray-300 text-gray-600"
                            }`}
                          >
                            {req}
                          </button>
                        ))}
                      </div>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* 取货时间 */}
              <Card className="mx-3 mb-2">
                <CardContent className="p-2.5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Clock className="w-4 h-4 text-[#FF6034]" />
                    <h3 className="font-bold text-sm">取货时间</h3>
                  </div>

                  {/* 智能时间选择器触发按钮 */}
                  <button
                    onClick={() => setShowTimePickerPage(true)}
                    className="w-full bg-gray-50 hover:bg-gray-100 rounded-lg p-2 border-2 border-dashed border-gray-300 hover:border-[#FF6034] transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        {pickupDate && pickupTime ? (
                          <div>
                            <div className="text-sm font-bold text-gray-900 mb-0.5">
                              {pickupDate} {pickupTime}
                            </div>
                            {pickupTimeRange && (
                              <div className="text-xs text-gray-600">
                                时间段：{pickupTimeRange}
                              </div>
                            )}
                            {pickupTimeNegotiable && (
                              <div className="text-xs text-orange-600 mt-0.5">
                                ⏰ 时间可协商
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400 text-xs">
                            点击选择取货时间 <span className="text-red-500">*</span>
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                    </div>
                  </button>
                </CardContent>
              </Card>
            </div>

            {/* 底部提交按钮 */}
            <div className="shrink-0 bg-white border-t px-4 py-2">
              <Button
                className="w-full h-12 bg-[#FF6034] hover:bg-[#FF6034]/90 text-white font-bold text-base shadow-md"
                onClick={handleSaveCargoInfo}
              >
                保存货物信息
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 智能时间选择器二级页面 */}
      {showTimePickerPage && (
        <SmartTimePickerPage
          isOpen={showTimePickerPage}
          initialDate={pickupDate}
          initialTime={pickupTime}
          initialTimeRange={pickupTimeRange}
          initialNegotiable={pickupTimeNegotiable}
          onClose={() => setShowTimePickerPage(false)}
          onSave={(data) => {
            setPickupDate(data.date);
            setPickupTime(data.time);
            setPickupTimeRange(data.timeRange || "");
            setPickupTimeNegotiable(data.negotiable);
            setShowTimePickerPage(false);
            toast.success("取货时间已设置");
          }}
        />
      )}
    </>
  );
}