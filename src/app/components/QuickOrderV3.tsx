import { useState, useEffect } from "react";
import { 
  X, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  RefreshCw 
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { AddressInputModal } from "@/app/components/AddressInputModal";
import { FullPaymentModal, type PaymentMethodType } from "@/app/components/FullPaymentModal";
import { VehicleTypeSelector, type VehicleConfig } from "@/app/components/VehicleTypeSelector";
import { SmartTimePickerPage } from "@/app/components/SmartTimePickerPage";
import { ReturnCargoRecommendModal, type ReturnCargoVehicle } from "@/app/components/ReturnCargoRecommendModal";
import type { Order } from "@/types/order";
import { extractCity } from "@/utils/formatters";
import { matchReturnCargos } from "@/utils/returnCargoMatcher";
import { toast } from "sonner";

// 货物预填充数据类型
export interface CargoPreFill {
  from?: string;
  to?: string;
  cargoType?: string;
  weight?: string;
  pickupAddress?: string;
  pickupContact?: string;
  pickupPhone?: string;
  deliveryAddress?: string;
  deliveryContact?: string;
  deliveryPhone?: string;
  // 是否锁定城市（从回程配货进入时为true）
  lockCities?: boolean;
}

interface QuickOrderV3Props {
  onClose: () => void;
  onSubmit: (orderData: Order) => void;
  cargo?: CargoPreFill;
}

// 包装方式选项
const PACKAGE_TYPES = ["纸箱", "托盘", "木架", "编织袋", "桶装", "裸装", "其他"];

// 货类明细选项（与找车模块保持一致）
const CARGO_TYPES = ["建筑材料", "电子产品", "日用品", "食品饮料", "机械设备", "化工原料", "农副产品", "钢材"];

// 附加要求选项
const SPECIAL_REQUIREMENTS = ["全程高速", "需要雨布", "带尾板", "有禁区", "签回单", "需装货", "需卸货", "压车", "送货入仓"];

// 车型选项
const VEHICLE_OPTIONS = [
  { label: "4.2米", value: "4.2" },
  { label: "6.8米", value: "6.8" },
  { label: "9.6米", value: "9.6" },
  { label: "13米", value: "13" },
  { label: "17.5米", value: "17.5" },
];

const VEHICLE_STYLES = ["高栏", "平板", "厢式"];

export function QuickOrderV3({ onClose, onSubmit, cargo }: QuickOrderV3Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);  // 🆕 添加Step 3

  // ========== Step 1: 货物信息 ==========
  const [cargoName, setCargoName] = useState(cargo?.cargoType || "");
  const [showCargoDropdown, setShowCargoDropdown] = useState(false);
  const [packageTypes, setPackageTypes] = useState<string[]>([]);
  const [weightOrVolume, setWeightOrVolume] = useState<"weight" | "volume">("weight");
  
  // 重量相关 - 范围输入
  const [weightMin, setWeightMin] = useState(""); // 最小重量（吨）
  const [weightMax, setWeightMax] = useState(""); // 最大重量（吨）
  
  // 体积相关 - 范围输入
  const [volumeMin, setVolumeMin] = useState(""); // 最小体积（立方米）
  const [volumeMax, setVolumeMax] = useState(""); // 最体积（立方米）
  
  // 附加要求
  const [specialRequirements, setSpecialRequirements] = useState<string[]>([]);

  // ========== Step 2: 订单确认 ==========
  const [pickupProvince, setPickupProvince] = useState("");
  const [pickupCity, setPickupCity] = useState(cargo?.from || ""); // 从回程配货带入
  const [pickupDistrict, setPickupDistrict] = useState("");
  const [pickupAddress, setPickupAddress] = useState(cargo?.pickupAddress || "");
  const [pickupContact, setPickupContact] = useState(cargo?.pickupContact || "");
  const [pickupPhone, setPickupPhone] = useState(cargo?.pickupPhone || "");
  
  const [deliveryProvince, setDeliveryProvince] = useState("");
  const [deliveryCity, setDeliveryCity] = useState(cargo?.to || ""); // 从回程配货带入
  const [deliveryDistrict, setDeliveryDistrict] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState(cargo?.deliveryAddress || "");
  const [deliveryContact, setDeliveryContact] = useState(cargo?.deliveryContact || "");
  const [deliveryPhone, setDeliveryPhone] = useState(cargo?.deliveryPhone || "");
  const [deliveryTimeRequired, setDeliveryTimeRequired] = useState(false); // 是否要求到货时间
  const [deliveryTime, setDeliveryTime] = useState("");

  // 显示发货人和收货人详情输入
  const [showSenderDetails, setShowSenderDetails] = useState(false);
  const [showReceiverDetails, setShowReceiverDetails] = useState(false);

  // 地址输入页面
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [addressInputType, setAddressInputType] = useState<"sender" | "receiver">("sender");
  
  // 🆕 回程配货推荐
  const [showReturnCargoRecommend, setShowReturnCargoRecommend] = useState(false);
  const [matchedReturnCargos, setMatchedReturnCargos] = useState<ReturnCargoVehicle[]>([]);
  const [hasCheckedReturnCargo, setHasCheckedReturnCargo] = useState(false); // 是否已经检查过回程配货

  // 车辆配置数组
  const [vehicles, setVehicles] = useState<VehicleConfig[]>([{ length: "", style: "" }]);
  
  // 车型选择器状态
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  
  const [pickupTime, setPickupTime] = useState("");
  
  // 智能时间选择器二级页面
  const [showTimePickerPage, setShowTimePickerPage] = useState(false);
  
  // 🆕 定价方式：一口价 / 竞价
  const [pricingMethod, setPricingMethod] = useState<"fixed" | "bidding">("fixed");
  const [fixedPrice, setFixedPrice] = useState(""); // 一口价金额
  
  // 🆕 竞价订单专属字段
  const [biddingDuration, setBiddingDuration] = useState(24); // 报价截止时间（小时）
  const [minAcceptablePrice, setMinAcceptablePrice] = useState(""); // 最低接受价（仅货主可见）
  
  // 🆕 智能推荐价格系统
  const [marketPriceRange, setMarketPriceRange] = useState({ min: 0, max: 0 }); // 市场均价区间
  const [recommendedPrice, setRecommendedPrice] = useState(0); // 推荐一口价
  
  // 🆕 智能定价方式推荐
  const [recommendedPricingMethod, setRecommendedPricingMethod] = useState<"fixed" | "bidding" | null>(null);
  const [recommendationReason, setRecommendationReason] = useState("");
  const [routeHistory, setRouteHistory] = useState<{
    isPopular: boolean;
    recentOrderCount: number;
    avgPrice: number;
  } | null>(null);
  
  // 🆕 定金支付相关状态
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState<any>(null);
  
  const [serviceType, setServiceType] = useState<"full" | "ltl">("full"); // 整车/零担
  const [freightPayment, setFreightPayment] = useState<"prepaid" | "collect">("collect"); // 运费支付：现付/到付
  const [invoiceType, setInvoiceType] = useState<"vat" | "normal" | "none">("none"); // 专票/普票/不开票
  
  const [estimatedFreight, setEstimatedFreight] = useState(""); // 预估运费
  
  // 🆕 检测回程配货的逻辑：当收发货城市都填写后触发
  useEffect(() => {
    // 如果是从回程配货进入（cargo.lockCities为true），则不再推荐
    if (cargo?.lockCities) {
      return;
    }
    
    // 如果已经检查过，不再重复检查
    if (hasCheckedReturnCargo) {
      return;
    }
    
    // 两个城市都填写完整才检测
    if (pickupCity && deliveryCity) {
      const matched = matchReturnCargos(pickupCity, deliveryCity, {
        maxResults: 5,
        sortBy: "discount"
      });
      
      if (matched.length > 0) {
        setMatchedReturnCargos(matched);
        setShowReturnCargoRecommend(true);
        setHasCheckedReturnCargo(true);
        
        // 提示音效（可选）
        console.log(`🚀 发现 ${matched.length} 条回程配货推荐：${pickupCity} → ${deliveryCity}`);
      }
    }
  }, [pickupCity, deliveryCity, cargo?.lockCities, hasCheckedReturnCargo]);

  // 切换包装方
  const togglePackageType = (type: string) => {
    setPackageTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
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

  // Step 1 验证
  const validateStep1 = () => {
    if (!cargoName) {
      toast.error("请选择货物类型");
      return false;
    }
    // 验证重量或体积至少填写一项
    const hasWeight = weightMin || weightMax;
    const hasVolume = volumeMin || volumeMax;
    if (!hasWeight && !hasVolume) {
      toast.error("请填写重量或体积信息");
      return false;
    }
    return true;
  };
  
  // 🆕 智能计算市场价格和推荐价格（在进入Step 2时触发）
  const calculateSmartPricing = () => {
    // 模拟市场价格计算逻辑
    // 实际应用中应该根据线路、车型、货物类型等从后端获取
    
    // 基础价格（根据车型）
    let basePrice = 1000;
    if (vehicles.length > 0 && vehicles[0].length) {
      const length = parseFloat(vehicles[0].length);
      if (length <= 4.2) basePrice = 800;
      else if (length <= 6.8) basePrice = 1200;
      else if (length <= 9.6) basePrice = 1800;
      else if (length <= 13) basePrice = 2500;
      else basePrice = 3500;
    }
    
    // 距离系数模拟，实际应根据起止地计算）
    const distanceFactor = 1.0 + Math.random() * 0.5;
    
    // 货物重量系数
    let weightFactor = 1.0;
    if (weightMin || weightMax) {
      const avgWeight = (parseFloat(weightMin || "0") + parseFloat(weightMax || weightMin || "0")) / 2;
      weightFactor = 1 + (avgWeight * 0.02);
    }
    
    // 计算市场均价区间
    const marketAvg = Math.round(basePrice * distanceFactor * weightFactor);
    const minPrice = Math.round(marketAvg * 0.9);
    const maxPrice = Math.round(marketAvg * 1.2);
    
    // 推荐一口价（市场均价）
    const recommended = marketAvg;
    
    setMarketPriceRange({ min: minPrice, max: maxPrice });
    setRecommendedPrice(recommended);
    
    // 自动填充推荐价格到一口价输入框
    if (!fixedPrice) {
      setFixedPrice(recommended.toString());
    }
    
    // 🆕 智能推荐定价方式
    analyzeRouteAndRecommendPricingMethod();
  };
  
  // 🆕 分析线路历史并推荐定价方式
  const analyzeRouteAndRecommendPricingMethod = () => {
    // 模拟分析线路历史数据（实际应从后端获取）
    const routeKey = `${pickupCity || extractCity(pickupProvince)}-${deliveryCity || extractCity(deliveryProvince)}`;
    
    // 模拟线路热度（随机生成，实际应查询数据库）
    const mockRecentOrderCount = Math.floor(Math.random() * 15); // 0-14单
    const mockAvgPrice = recommendedPrice || 1500;
    
    const isPopularRoute = mockRecentOrderCount >= 5; // 近7天>=5单视为热门线路
    const isNewRoute = mockRecentOrderCount === 0; // 0单视为新线路
    
    setRouteHistory({
      isPopular: isPopularRoute,
      recentOrderCount: mockRecentOrderCount,
      avgPrice: mockAvgPrice,
    });
    
    // 推荐逻辑
    if (isPopularRoute) {
      setRecommendedPricingMethod("fixed");
      setRecommendationReason(`该线路近7天成交${mockRecentOrderCount}单，市场活跃，建议使一口价快速成交`);
    } else if (isNewRoute) {
      setRecommendedPricingMethod("bidding");
      setRecommendationReason("该线路为新路线，建议使用竞价模式探索最优价格");
    } else {
      // 中等热度线路，根据价格合理性推荐
      const isReasonablePrice = fixedPrice && parseFloat(fixedPrice) >= marketPriceRange.min;
      if (isReasonablePrice) {
        setRecommendedPricingMethod("fixed");
        setRecommendationReason(`近7天有${mockRecentOrderCount}单成交，价格合理，推荐一口价快速成交`);
      } else {
        setRecommendedPricingMethod("bidding");
        setRecommendationReason(`近7天仅${mockRecentOrderCount}单成交，建议��价寻找更优价格`);
      }
    }
  };

  // Step 1 到 Step 2 的跳转
  const handleNext = () => {
    if (step === 1) {
      if (!validateStep1()) return;
      
      // 🆕 进入Step 2时，计算智能推荐价格
      calculateSmartPricing();
      
      setStep(2);
    }
  };

  // Step 2 验证并提交
  const handleSubmit = () => {
    if (!pickupProvince || !pickupCity || !pickupDistrict || !pickupAddress.trim()) {
      toast.error("请完整填写发货地址");
      return;
    }
    if (!pickupContact.trim()) {
      toast.error("请填写发货人姓名");
      return;
    }
    if (!pickupPhone.trim() || !/^1[3-9]\d{9}$/.test(pickupPhone)) {
      toast.error("请填写正确的发货人手机号");
      return;
    }
    if (!deliveryProvince || !deliveryCity || !deliveryDistrict || !deliveryAddress.trim()) {
      toast.error("请完整填写收货地址");
      return;
    }
    if (!deliveryContact.trim()) {
      toast.error("请填写收货人姓名");
      return;
    }
    if (!deliveryPhone.trim() || !/^1[3-9]\d{9}$/.test(deliveryPhone)) {
      toast.error("请填写正确的收货人手机号");
      return;
    }
    // 🔄 检查车辆配置
    if (vehicles.length === 0 || !vehicles.every(v => v.length && v.style)) {
      toast.error("请完整配置所车辆的车和车型");
      return;
    }
    if (!pickupTime) {
      toast.error("请选择装货时间");
      return;
    }
    
    // 🆕 一口价验证
    if (pricingMethod === "fixed") {
      if (!fixedPrice || parseFloat(fixedPrice) <= 0) {
        toast.error("请输入有效的一口价金额");
        return;
      }
    }

    const timestamp = Date.now();
    const orderNumber = `YLB${timestamp.toString().slice(-8)}`;
    const contractNumber = `CT${timestamp.toString().slice(-8)}`;

    const fromCityName = `${pickupProvince}${pickupCity}${pickupDistrict}`;
    const toCityName = `${deliveryProvince}${deliveryCity}${deliveryDistrict}`;

    // 计算最终重量（用范围平均值）
    const hasWeight = weightMin || weightMax;
    const hasVolume = volumeMin || volumeMax;
    
    let finalWeight = 0;
    let weightInfo = "";
    if (hasWeight) {
      const min = parseFloat(weightMin || "0");
      const max = parseFloat(weightMax || weightMin || "0");
      finalWeight = (min + max) / 2;
      weightInfo = weightMin && weightMax ? `${weightMin}-${weightMax}吨` : `${weightMin || weightMax}吨`;
    } else if (hasVolume) {
      const min = parseFloat(volumeMin || "0");
      const max = parseFloat(volumeMax || volumeMin || "0");
      const avgVolume = (min + max) / 2;
      finalWeight = avgVolume * 0.4; // 体积转重量估算
      weightInfo = volumeMin && volumeMax ? `${volumeMin}-${volumeMax}方` : `${volumeMin || volumeMax}方`;
    }

    const cargoDescription = `${cargoName}，${packageTypes.join("、")}`;
    const specialReqs = [];
    specialReqs.push(weightInfo);
    
    // 🆕 根据定价方式确定价格
    const orderPrice = pricingMethod === "fixed" 
      ? parseFloat(fixedPrice) 
      : (estimatedFreight ? parseFloat(estimatedFreight) : 0);

    const order: Order = {
      id: `ORD${timestamp}`,
      orderNumber,
      contractNumber,
      route: `${fromCityName} → ${toCityName}`,
      fromCity: fromCityName,
      toCity: toCityName,
      from: pickupAddress,
      to: deliveryAddress,
      cargo: cargoDescription,
      cargoType: cargoName,
      weight: finalWeight,
      price: orderPrice,
      fixedPrice: pricingMethod === "fixed" ? parseFloat(fixedPrice) : undefined, // 🆕 一口价专属字段
      // 🆕 竞价订单专属字段
      biddingDuration: pricingMethod === "bidding" ? biddingDuration : undefined,
      minAcceptablePrice: pricingMethod === "bidding" && minAcceptablePrice ? parseFloat(minAcceptablePrice) : undefined,
      dispatchRange: "return",
      pickupAddress: `${fromCityName}${pickupAddress}`,
      pickupContact,
      pickupPhone,
      pickupTime,
      deliveryAddress: `${toCityName}${deliveryAddress}`,
      deliveryContact,
      deliveryPhone,
      deliveryTime: deliveryTimeRequired ? deliveryTime : undefined,
      loadingRequirement: "",
      specialRequirement: specialReqs.join("；"),
      vehicleType: vehicles.map(v => `${v.length}米${v.style}`).join("、"),
      paymentMethod: freightPayment === "prepaid" ? "prepaid" : "postpaid",
      pricingMethod, // 🆕 保存定价方式
      status: "published",
      createTime: new Date().toISOString(),
    };

    // 🆕 不直接提交，而是暂存订单数据并打开支付弹窗（仅寄付模式）
    if (freightPayment === "prepaid") {
      const totalAmount = orderPrice || 5000;
      const paymentAmount = totalAmount; // 全款
      
      // 添加支付信息
      const orderWithPayment = {
        ...order,
        paymentAmount,
        paymentPaid: false,
        totalVehicles: vehicles.length > 1 ? vehicles.length : undefined,
      };
      
      // 暂存订单数据
      setPendingOrderData(orderWithPayment);
      
      // 打开支付弹窗
      setShowDepositModal(true);
    } else {
      // 到付模式：直接提交订单，无需支付
      onSubmit(order);
      toast.success("订单已发布", { description: "司机将与收货人联系确认价格" });
      onClose();
    }
  };

  // 🆕 处理支付成功（全款）
  const handleDepositPayment = (paymentMethod: PaymentMethodType) => {
    if (!pendingOrderData) return;
    
    const timestamp = Date.now();
    const vehicleCount = vehicles.length;
    
    // 更新订单：添加支付信息
    const paidOrderData = {
      ...pendingOrderData,
      paymentPaid: true,
      paymentMethod_type: paymentMethod,
      paymentPaidTime: new Date().toISOString(),
      paymentTransactionId: `TXN${timestamp.toString().slice(-10)}`,
    };
    
    // 🔥 多车逻辑判断
    if (vehicleCount === 1) {
      // 单车：直接提交订单
      onSubmit(paidOrderData);
      toast.success("支付成功", { description: "订单已生成" });
    } else {
      // 多车：生成主订单+子订单
      const orders = generateMultiVehicleOrders(paidOrderData, vehicleCount);
      
      // 提交所有订单
      orders.forEach(order => onSubmit(order));
      
      toast.success("支付成功", { 
        description: `已生成${vehicleCount}个关联订单` 
      });
    }
    
    // 关闭弹窗并清理
    setShowDepositModal(false);
    setPendingOrderData(null);
    onClose();
  };

  // 🆕 生成多车订单（全款）
  function generateMultiVehicleOrders(baseOrder: any, count: number): Order[] {
    const timestamp = Date.now();
    const contractNumber = baseOrder.contractNumber; // 共享合同号
    const paymentPerVehicle = Math.round(baseOrder.paymentAmount / count); // 运费分配
    
    const orders: Order[] = [];
    
    // 生成主订单
    const mainOrder: Order = {
      ...baseOrder,
      id: `ORD${timestamp}`,
      childOrderIds: [],
      totalVehicles: count,
    };
    
    // 生成子订单
    for (let i = 1; i <= count; i++) {
      const childId = `ORD${timestamp}_${i}`;
      
      const childOrder: Order = {
        ...baseOrder,
        id: childId,
        orderNumber: `${baseOrder.orderNumber}-${i}`, // YLB12345678-1
        parentOrderId: mainOrder.id,
        vehicleIndex: i,
        contractNumber, // 共享合同号
        paymentAmount: paymentPerVehicle, // 分配运费
        totalVehicles: count,
      };
      
      orders.push(childOrder);
      mainOrder.childOrderIds!.push(childId);
    }
    
    // 主订单放在第一个
    orders.unshift(mainOrder);
    
    return orders;
  }

  return (
    <>
      {/* 遮罩层 */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 主内容 */}
      <div className="fixed inset-x-0 top-0 bottom-0 z-50 flex flex-col bg-gray-50">
        {/* 顶部导航栏 */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
          {step === 1 ? (
            <button onClick={onClose} className="p-1">
              <X className="w-6 h-6 text-gray-600" />
            </button>
          ) : (
            <button onClick={() => setStep(1)} className="p-1">
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
          )}
          <h2 className="text-lg font-bold text-gray-900">
            {step === 1 ? "货物信息" : "发货信息"}
          </h2>
          <div className="w-6" />
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto pb-16">
          {step === 1 ? (
            // ========== Step 1: 货物信息 ==========
            <div className="p-2 space-y-2">
              {/* 货物类型 */}
              <Card className="p-2.5 relative">
                <button
                  onClick={() => setShowCargoDropdown(!showCargoDropdown)}
                  className="w-full flex items-center justify-between"
                >
                  <span className="text-sm text-gray-600">
                    货物类型 <span className="text-red-500">*</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-base font-medium ${cargoName ? "text-gray-900" : "text-gray-400"}`}>
                      {cargoName || "请选择"}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </button>

                {/* 下拉菜单 */}
                {showCargoDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-50"
                      onClick={() => setShowCargoDropdown(false)}
                    />
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto">
                      {CARGO_TYPES.map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setCargoName(type);
                            setShowCargoDropdown(false);
                          }}
                          className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
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
              <Card className="p-2.5">
                <div className="text-sm text-gray-600 mb-1.5">包装方式</div>
                <div className="flex flex-wrap gap-1.5">
                  {PACKAGE_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => togglePackageType(type)}
                      className={`px-2.5 py-1 rounded-full border-2 text-sm font-medium transition-colors ${
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
              <Card className="p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-600">
                    总重量/体积（选填一项） <span className="text-red-500">*</span>
                  </span>
                </div>

                {/* 重量范围 */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm w-12 ${volumeMin || volumeMax ? 'text-gray-400' : 'text-gray-900'}`}>重量</span>
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
                    <span className="text-sm text-gray-600">吨</span>
                  </div>
                </div>

                {/* 体积范围 */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm w-12 ${weightMin || weightMax ? 'text-gray-400' : 'text-gray-900'}`}>体积</span>
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
                    <span className="text-sm text-gray-600">方</span>
                  </div>
                </div>
              </Card>

              {/* 车型要求 */}
              <button
                onClick={() => setShowVehicleSelector(true)}
                className="w-full"
              >
                <Card className="p-2.5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">车型要求</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">
                        {vehicles.some(v => v.length && v.style)
                          ? vehicles.map((v, i) => `${v.length}米${v.style}`).join("、") || "请选择"
                          : "请选择"}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </Card>
              </button>

              {/* 附加要求 */}
              <Card className="p-2.5">
                <div className="text-sm text-gray-600 mb-1.5">附加要求</div>
                <div className="flex flex-wrap gap-1.5">
                  {SPECIAL_REQUIREMENTS.map((req) => (
                    <button
                      key={req}
                      onClick={() => toggleSpecialRequirement(req)}
                      className={`px-2.5 py-1 rounded-full border-2 text-sm font-medium transition-colors ${
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
          ) : (
            // ========== Step 2: 订单确认 ==========
            <div className="flex-1 overflow-y-auto">
              {/* 回程配货锁定提示 */}
              {cargo?.lockCities && (
                <div className="mx-2 mt-2 mb-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                  <div className="flex items-start gap-2">
                    <div className="shrink-0 mt-0.5">
                      <div className="w-5 h-5 rounded-full bg-[#FF6034] flex items-center justify-center">
                        <span className="text-white text-xs font-bold">🔒</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-[#FF6034] mb-1">
                        回程配货单
                      </div>
                      <div className="text-xs text-gray-600 leading-relaxed">
                        司机指定线路：<span className="font-medium text-gray-900">{pickupCity} → {deliveryCity}</span>
                        <br />
                        起止城市已锁定，不可修改。如需修��请点击"发货"按钮重新发布。
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 发货和收货人信息卡片 */}
              <Card className="mx-2 mb-3 p-0 overflow-hidden">
                {/* 发货人信息卡片 - 简洁版 */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setAddressInputType("sender");
                      setShowAddressInput(true);
                    }}
                    className="w-full"
                  >
                    <div className="flex items-start gap-3 py-4 px-4 text-left">
                      {/* 左侧图标 */}
                      <div className="shrink-0 w-8 h-8 rounded-full bg-black flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>

                      {/* 中间内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-base">发货人信息</h3>
                            {cargo?.lockCities && (
                              <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                                🔒 城市已锁定
                              </span>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        
                        {!pickupContact ? (
                          <div className="text-sm text-gray-400">
                            请输入真实姓名
                          </div>
                        ) : (
                          <div className="space-y-1 text-sm text-gray-700">
                            <div>{pickupContact} {pickupPhone}</div>
                            <div className="text-gray-500">
                              {pickupProvince}{pickupCity}{pickupDistrict} {pickupAddress}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* 连接线 */}
                  <div className="absolute left-7 top-16 bottom-0 w-px border-l-2 border-dashed border-gray-300" />
                </div>

                {/* 中间互换按 */}
                <div className="flex items-center justify-start pl-7 -my-2 relative z-10">
                  {cargo?.lockCities ? (
                    <div className="h-8 w-8 rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">🔒</span>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full border-2 border-gray-300 bg-white hover:border-[#FF6034] hover:bg-white hover:text-[#FF6034] shadow-sm transition-all"
                      onClick={() => {
                        // 互换寄收件人信息
                        const tempContact = pickupContact;
                        const tempPhone = pickupPhone;
                        const tempProvince = pickupProvince;
                        const tempCity = pickupCity;
                        const tempDistrict = pickupDistrict;
                        const tempAddress = pickupAddress;

                        setPickupContact(deliveryContact);
                        setPickupPhone(deliveryPhone);
                        setPickupProvince(deliveryProvince);
                        setPickupCity(deliveryCity);
                        setPickupDistrict(deliveryDistrict);
                        setPickupAddress(deliveryAddress);

                        setDeliveryContact(tempContact);
                        setDeliveryPhone(tempPhone);
                        setDeliveryProvince(tempProvince);
                        setDeliveryCity(tempCity);
                        setDeliveryDistrict(tempDistrict);
                        setDeliveryAddress(tempAddress);

                        toast.success("已互换发货和收货人信息");
                      }}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* 收货人信息卡片 - 简洁版 */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setAddressInputType("receiver");
                      setShowAddressInput(true);
                    }}
                    className="w-full"
                  >
                    <div className="flex items-start gap-3 py-4 px-4 text-left">
                      {/* 左侧图标 */}
                      <div className="shrink-0 w-8 h-8 rounded-full bg-[#FF6034] flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>

                      {/* 中间内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-base">收货人信息</h3>
                            {cargo?.lockCities && (
                              <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                                🔒 城市已锁定
                              </span>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        
                        <div className="text-xs text-gray-400 mb-2">
                          支持地址粘贴、图片识别
                        </div>

                        {!deliveryContact ? (
                          <div className="text-sm text-gray-400">
                            请输入真姓名
                          </div>
                        ) : (
                          <div className="space-y-1 text-sm text-gray-700">
                            <div>{deliveryContact} {deliveryPhone}</div>
                            <div className="text-gray-500">
                              {deliveryProvince}{deliveryCity}{deliveryDistrict} {deliveryAddress}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              </Card>

              {/* 货物摘要 */}
              <Card className="mx-2 p-2.5">
                <div className="text-sm text-gray-600 mb-1">货物信息</div>
                <div className="text-base text-gray-900">
                  {cargoName}
                  {packageTypes.length > 0 && `，${packageTypes.join("+")}`}
                  {((weightMin || weightMax) || (volumeMin || volumeMax)) && "，"}
                  {(weightMin || weightMax) && (
                    <>
                      {weightMin && weightMax ? `${weightMin}-${weightMax}吨` : weightMin ? `${weightMin}吨` : `${weightMax}吨`}
                    </>
                  )}
                  {(weightMin || weightMax) && (volumeMin || volumeMax) && "/"}
                  {(volumeMin || volumeMax) && (
                    <>
                      {volumeMin && volumeMax ? `${volumeMin}-${volumeMax}m³` : volumeMin ? `${volumeMin}m³` : `${volumeMax}m³`}
                    </>
                  )}
                  {specialRequirements.length > 0 && `，${specialRequirements.join("、")}`}
                </div>
              </Card>

              {/* 时间要求 - 智能时间段选择器 */}
              <button
                onClick={() => setShowTimePickerPage(true)}
                className="w-full"
              >
                <Card className="mx-2 p-2.5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">取货时间</span>
                      <Badge variant="destructive" className="text-xs">必填</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {pickupTime ? (
                        <span className="text-sm text-gray-900 font-medium">
                          {(() => {
                            const date = new Date(pickupTime);
                            return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                          })()}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">请选择</span>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </Card>
              </button>
              
              {/* 运费支付 */}
              <Card className="mx-2 p-2.5">
                <div className="text-sm text-gray-600 mb-1.5">运费支付方式</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setFreightPayment("prepaid")}
                    className={`py-1.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                      freightPayment === "prepaid"
                        ? "border-[#FF6034] text-[#FF6034] bg-orange-50"
                        : "border-gray-300 text-gray-600"
                    }`}
                  >
                    现付
                  </button>
                  <button
                    onClick={() => setFreightPayment("collect")}
                    className={`py-1.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                      freightPayment === "collect"
                        ? "border-[#FF6034] text-[#FF6034] bg-orange-50"
                        : "border-gray-300 text-gray-600"
                    }`}
                  >
                    到付
                  </button>
                </div>
              </Card>

              {/* 🆕 定价方式选择 */}
              <Card className="mx-2 p-2.5">
                <div className="text-sm text-gray-600 mb-1.5 flex items-center gap-1">
                  定价方式
                  <Badge variant="outline" className="text-xs py-0 h-4">推荐</Badge>
                </div>
                
                {/* 🆕 智能推荐卡片 */}
                {recommendedPricingMethod && recommendationReason && (
                  <div className={`mb-2 p-2 rounded-lg border-2 ${
                    recommendedPricingMethod === "fixed"
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300"
                      : "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300"
                  }`}>
                    <div className="flex items-start gap-2">
                      <div className="text-lg">
                        {recommendedPricingMethod === "fixed" ? "⚡" : "🎯"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-xs font-bold ${
                            recommendedPricingMethod === "fixed" ? "text-blue-700" : "text-purple-700"
                          }`}>
                            {recommendedPricingMethod === "fixed" ? "推荐：一口价" : "推荐：竞价模式"}
                          </span>
                          {routeHistory && (
                            <Badge variant="outline" className={`text-[10px] py-0 h-4 ${
                              recommendedPricingMethod === "fixed"
                                ? "border-blue-300 text-blue-600"
                                : "border-purple-300 text-purple-600"
                            }`}>
                              近7天{routeHistory.recentOrderCount}单
                            </Badge>
                          )}
                        </div>
                        <p className={`text-[10px] leading-relaxed ${
                          recommendedPricingMethod === "fixed" ? "text-blue-600" : "text-purple-600"
                        }`}>
                          {recommendationReason}
                        </p>
                        {recommendedPricingMethod !== pricingMethod && (
                          <button
                            onClick={() => setPricingMethod(recommendedPricingMethod)}
                            className={`mt-1.5 text-[10px] px-2 py-0.5 rounded ${
                              recommendedPricingMethod === "fixed"
                                ? "bg-blue-500 hover:bg-blue-600"
                                : "bg-purple-500 hover:bg-purple-600"
                            } text-white transition-colors`}
                          >
                            采纳推荐
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  {/* 一口价 */}
                  <button
                    onClick={() => setPricingMethod("fixed")}
                    className={`p-2 rounded-lg border-2 text-left transition-all ${
                      pricingMethod === "fixed"
                        ? "border-[#FF6034] bg-orange-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-bold ${pricingMethod === "fixed" ? "text-[#FF6034]" : "text-gray-900"}`}>
                        一口价
                      </span>
                      {pricingMethod === "fixed" && (
                        <span className="text-xs text-[#FF6034]">✓</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      您定价格，司机接单快
                    </p>
                  </button>

                  {/* 竞价 */}
                  <button
                    onClick={() => setPricingMethod("bidding")}
                    className={`p-2 rounded-lg border-2 text-left transition-all ${
                      pricingMethod === "bidding"
                        ? "border-[#FF6034] bg-orange-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-bold ${pricingMethod === "bidding" ? "text-[#FF6034]" : "text-gray-900"}`}>
                        竞价
                      </span>
                      {pricingMethod === "bidding" && (
                        <span className="text-xs text-[#FF6034]"></span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      司机报价，您选最优
                    </p>
                  </button>
                </div>

                {/* 一口价金额输入 */}
                {pricingMethod === "fixed" && (
                  <div className="mt-2 space-y-2">
                    {/* 市场价格参考 */}
                    {marketPriceRange.min > 0 && (
                      <div className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">💡 当前线路市场均价</span>
                          <span className="text-xs font-bold text-blue-700">
                            ¥{marketPriceRange.min.toLocaleString()} ~ ¥{marketPriceRange.max.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-500">推荐一口价：</span>
                          <span className="text-sm font-bold text-[#FF6034]">
                            ¥{recommendedPrice.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-gray-500">（90%订单在此区间成交）</span>
                          <button
                            onClick={() => setFixedPrice(recommendedPrice.toString())}
                            className="ml-auto text-[10px] px-2 py-0.5 bg-[#FF6034] text-white rounded hover:bg-[#FF6034]/90"
                          >
                            使用推荐
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* 价格输入 */}
                    <div className="p-2 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-700 font-medium">运费</span>
                        <span className="text-xs text-gray-500">¥</span>
                        <Input
                          type="number"
                          value={fixedPrice}
                          onChange={(e) => setFixedPrice(e.target.value)}
                          placeholder={recommendedPrice > 0 ? recommendedPrice.toString() : "请输入价格"}
                          className="flex-1 text-right h-8 bg-white border-orange-300 focus:border-[#FF6034] font-bold text-lg"
                        />
                        <span className="text-sm text-gray-700">元</span>
                      </div>
                      <div className="text-[10px] text-gray-500 text-center mt-1">
                        💳 签约后需支付全额运费
                      </div>
                    </div>
                    
                    {/* 价格合理性提示 */}
                    {fixedPrice && marketPriceRange.min > 0 && (
                      <div className={`p-2 rounded-lg border text-[10px] ${
                        parseFloat(fixedPrice) < marketPriceRange.min * 0.8
                          ? "bg-red-50 border-red-200 text-red-700"
                          : parseFloat(fixedPrice) > marketPriceRange.max * 1.3
                          ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                          : "bg-green-50 border-green-200 text-green-700"
                      }`}>
                        {parseFloat(fixedPrice) < marketPriceRange.min * 0.8
                          ? "⚠️ 价格偏低，可能导致无司机接单，建议提高至市场均价"
                          : parseFloat(fixedPrice) > marketPriceRange.max * 1.3
                          ? " 价格偏高，可能影响成交速度，但能优先获得优质司机"
                          : "✅ 价格合理，预计30分钟内有司机接单"}
                      </div>
                    )}
                  </div>
                )}

                {/* 竞价说明 */}
                {pricingMethod === "bidding" && (
                  <div className="mt-2 space-y-2">
                    {/* 智能提示 */}
                    <div className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs font-bold text-blue-700">💡 竞价模式推荐</span>
                        <Badge variant="outline" className="text-[10px] py-0 h-4 border-blue-300 text-blue-700">新线路适用</Badge>
                      </div>
                      <p className="text-[10px] text-blue-600 leading-relaxed">
                        平均3.2名司机报价，帮您优选承运方，获得最优价格
                      </p>
                    </div>
                    
                    {/* 报价截止时间 */}
                    <div className="p-2 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 font-medium">报价截止时间</span>
                        <Badge variant="outline" className="text-xs">默认24小时</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[24, 48, 72].map((hours) => (
                          <button
                            key={hours}
                            onClick={() => setBiddingDuration(hours)}
                            className={`py-1.5 px-2 rounded border-2 text-xs font-medium transition-colors ${
                              biddingDuration === hours
                                ? "border-[#FF6034] text-[#FF6034] bg-orange-50"
                                : "border-gray-300 text-gray-600 hover:border-gray-400"
                            }`}
                          >
                            {hours}小时
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* 最低接受价（可选） */}
                    <div className="p-2 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 font-medium">最低接受价</span>
                        <Badge variant="outline" className="text-xs">可选</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">¥</span>
                        <Input
                          type="number"
                          value={minAcceptablePrice}
                          onChange={(e) => setMinAcceptablePrice(e.target.value)}
                          placeholder="仅您可见，用于筛选低价"
                          className="flex-1 text-right h-7 bg-gray-50"
                        />
                        <span className="text-xs text-gray-500">元</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">
                        🔒 仅货主可见，低于此价格的报价将被自动过滤
                      </p>
                    </div>
                    
                    {/* 市场价格参考 */}
                    {marketPriceRange.min > 0 && (
                      <div className="p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">📊 市场参考价</span>
                          <span className="text-xs font-bold text-green-700">
                            ¥{marketPriceRange.min.toLocaleString()} ~ ¥{marketPriceRange.max.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* 发票类型 */}
              <Card className="mx-2 p-2.5">
                <div className="text-sm text-gray-600 mb-1.5">发票类型</div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setInvoiceType("vat")}
                    className={`py-1.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                      invoiceType === "vat"
                        ? "border-[#FF6034] text-[#FF6034] bg-orange-50"
                        : "border-gray-300 text-gray-600"
                    }`}
                  >
                    专票
                  </button>
                  <button
                    onClick={() => setInvoiceType("normal")}
                    className={`py-1.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                      invoiceType === "normal"
                        ? "border-[#FF6034] text-[#FF6034] bg-orange-50"
                        : "border-gray-300 text-gray-600"
                    }`}
                  >
                    普票
                  </button>
                  <button
                    onClick={() => setInvoiceType("none")}
                    className={`py-1.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                      invoiceType === "none"
                        ? "border-[#FF6034] text-[#FF6034] bg-orange-50"
                        : "border-gray-300 text-gray-600"
                    }`}
                  >
                    不开票
                  </button>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="bg-white border-t border-gray-200 p-2.5 shrink-0">
          <Button
            onClick={() => {
              if (step === 1) {
                handleNext();
              } else {
                handleSubmit();
              }
            }}
            className="w-full h-10 bg-[#FF6034] hover:bg-[#FF6034]/90 text-white font-bold text-base rounded-lg"
          >
            {step === 1 ? "下一步" : "发布订单"}
          </Button>
        </div>
      </div>

      {/* 地址输入模态框 */}
      {addressInputType === "sender" && (
        <AddressInputModal
          type="sender"
          isOpen={showAddressInput}
          lockCity={cargo?.lockCities} // 传递城市锁定标志
          initialData={{
            contact: pickupContact,
            phone: pickupPhone,
            province: pickupProvince,
            city: pickupCity,
            district: pickupDistrict,
            address: pickupAddress,
          }}
          onClose={() => setShowAddressInput(false)}
          onSave={(data) => {
            setPickupContact(data.contact);
            setPickupPhone(data.phone);
            setPickupProvince(data.province);
            setPickupCity(data.city);
            setPickupDistrict(data.district);
            setPickupAddress(data.address);
            setShowAddressInput(false);
          }}
        />
      )}

      {/* 收件人地址输入模态框 */}
      {addressInputType === "receiver" && (
        <AddressInputModal
          type="receiver"
          isOpen={showAddressInput}
          lockCity={cargo?.lockCities} // 传递城市锁定标志
          initialData={{
            contact: deliveryContact,
            phone: deliveryPhone,
            province: deliveryProvince,
            city: deliveryCity,
            district: deliveryDistrict,
            address: deliveryAddress,
          }}
          onClose={() => setShowAddressInput(false)}
          onSave={(data) => {
            setDeliveryContact(data.contact);
            setDeliveryPhone(data.phone);
            setDeliveryProvince(data.province);
            setDeliveryCity(data.city);
            setDeliveryDistrict(data.district);
            setDeliveryAddress(data.address);
            setShowAddressInput(false);
          }}
        />
      )}

      {/* 全款支付模态框 */}
      {showDepositModal && pendingOrderData && (
        <FullPaymentModal
          isOpen={showDepositModal}
          onClose={() => {
            setShowDepositModal(false);
            setPendingOrderData(null);
          }}
          onConfirm={handleDepositPayment}
          paymentAmount={pendingOrderData.paymentAmount || 0}
          totalAmount={pendingOrderData.price || 0}
          orderNumber={pendingOrderData.orderNumber}
          vehicleCount={vehicles.length}
        />
      )}

      {/* 车型选择器模态框 */}
      {showVehicleSelector && (
        <VehicleTypeSelector
          isOpen={showVehicleSelector}
          onClose={() => setShowVehicleSelector(false)}
          vehicles={vehicles}
          onConfirm={(newVehicles) => {
            setVehicles(newVehicles);
            setShowVehicleSelector(false);
          }}
          weightMin={weightMin}
          weightMax={weightMax}
          volumeMin={volumeMin}
          volumeMax={volumeMax}
        />
      )}

      {/* 智能时间选择器二级页面 */}
      <SmartTimePickerPage
        isOpen={showTimePickerPage}
        onClose={() => setShowTimePickerPage(false)}
        onSave={(data) => {
          // 将日期和时间合并为ISO字符串
          const dateTime = new Date(`${data.date}T${data.time}`);
          setPickupTime(dateTime.toISOString());
          setShowTimePickerPage(false);
        }}
      />
      
      {/* 🆕 回程配货推荐弹窗 */}
      <ReturnCargoRecommendModal
        isOpen={showReturnCargoRecommend}
        onClose={() => setShowReturnCargoRecommend(false)}
        matchedVehicles={matchedReturnCargos}
        fromCity={pickupCity}
        toCity={deliveryCity}
        onSelectReturnCargo={(vehicle) => {
          // 用户选择了回程配货，跳转到ReturnCargoOrder
          toast.success(`已选择 ${vehicle.driverName} 的回程配货车辆`);
          
          // TODO: 这里需要关闭当前QuickOrderV3，打开ReturnCargoOrder
          // 由于QuickOrderV3是在App.tsx中调用的，需要向上传递事件
          // 目前先简单提示，实际应该传递回调函数
          console.log("选择的回程配货车辆:", vehicle);
          
          // 关闭当前表单
          onClose();
          
          // 提示用户：暂时的解决方案是让用户从首页进入回程配货
          toast.info("请从首页「找车」页面中选择该回程配货车辆下单");
        }}
        onContinueNormalOrder={() => {
          // 用户选择继续正常发货，关闭推荐弹窗，继续填写表单
          toast.info("继续正常发货流程");
        }}
      />
    </>
  );
}