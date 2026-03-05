/**
 * 智能下单引导组件
 * 针对个人货主优化：极简流程、大白话、智能推荐
 */

import { useState, useEffect } from "react";
import { X, Mic, Camera, MapPin, Phone, User, Package, Calendar, DollarSign, Truck, CheckCircle, ArrowRight, HelpCircle, Sparkles, Info } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Badge } from "@/app/components/ui/badge";
import { toast } from "sonner";
import { VEHICLE_TYPES } from "@/data/vehicles";
import { extractCity } from "@/utils/formatters";
import { storage, STORAGE_KEYS } from "@/utils/storage";
import { showToast, getCurrentTime, generateOrderNumber, generateContractNumber } from "@/utils/helpers";
import { TIMING } from "@/config/constants";
import type { Order } from "@/types/order";
import { SecurePaymentOptions, type SecurePaymentType } from "@/app/components/SecurePaymentOptions";

// 常用地址
interface SavedAddress {
  id: string;
  label: string;
  address: string;
  contact: string;
  phone: string;
}

// 价格明细
interface PriceBreakdown {
  baseFare: number;        // 基础运费
  distanceFee: number;     // 里程费
  weightFee: number;       // 重量费
  highwayFee: number;      // 高速费（预估）
  total: number;           // 总计
  marketMin: number;       // 市场最低价
  marketMax: number;       // 市场最高价
}

interface SmartOrderGuideProps {
  onClose: () => void;
  onSubmit: (orderData: Order) => void;
}

export function SmartOrderGuide({ onClose, onSubmit }: SmartOrderGuideProps) {
  // ========== 步骤控制（3步极简流程）==========
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // ========== Step 1: 从哪到哪 ==========
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  
  // ========== Step 2: 什么货 ==========
  const [cargoType, setCargoType] = useState("");
  const [weight, setWeight] = useState("");
  const [volume, setVolume] = useState(""); // 体积（立方米）
  const [cargoPhoto, setCargoPhoto] = useState<string | null>(null);
  
  // ========== Step 3: 确认信息 ==========
  const [pickupContact, setPickupContact] = useState("");
  const [pickupPhone, setPickupPhone] = useState("");
  const [pickupTime, setPickupTime] = useState("立即发货");
  const [deliveryContact, setDeliveryContact] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"prepaid" | "collect">("prepaid");
  const [pricingMethod, setPricingMethod] = useState<"fixed" | "bidding">("fixed");

  // ========== 智能推荐 ==========
  const [recommendedVehicle, setRecommendedVehicle] = useState<typeof VEHICLE_TYPES[0] | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [showPriceDetail, setShowPriceDetail] = useState(false);

  // ========== 常用地址 ==========
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [showAddressBook, setShowAddressBook] = useState<'pickup' | 'delivery' | null>(null);

  // ========== 语音输入支持 ==========
  const [isListening, setIsListening] = useState(false);
  const [voiceField, setVoiceField] = useState<'pickup' | 'delivery' | null>(null);

  // 初始化：加载常用地址
  useEffect(() => {
    const addresses = storage.get<SavedAddress[]>(STORAGE_KEYS.SAVED_ADDRESSES, []);
    setSavedAddresses(addresses);
  }, []);

  // 智能车型推荐
  useEffect(() => {
    if (weight && parseFloat(weight) > 0) {
      const weightNum = parseFloat(weight);
      const volumeNum = volume ? parseFloat(volume) : 0;

      // 根据重量和体积推荐车型
      const recommended = VEHICLE_TYPES.find(vehicle => {
        const weightOk = weightNum <= vehicle.capacity * 0.95;
        const volumeOk = volumeNum === 0 || volumeNum <= vehicle.volume * 0.95;
        return weightOk && volumeOk;
      });

      if (recommended) {
        setRecommendedVehicle(recommended);
        
        // 计算价格明细
        const distance = 50; // 默认50公里，实际应该根据地址计算
        const baseFare = 100; // 起步价
        const distanceFee = distance * 3; // 每公里3元
        const weightFee = weightNum * 80; // 每吨80元
        const highwayFee = Math.floor(distance / 10) * 15; // 预估高速费
        const total = baseFare + distanceFee + weightFee + highwayFee;
        
        setPriceBreakdown({
          baseFare,
          distanceFee,
          weightFee,
          highwayFee,
          total,
          marketMin: total * 0.9,
          marketMax: total * 1.1,
        });
      }
    }
  }, [weight, volume]);

  // 语音输入（模拟，实际需要浏览器API）
  const handleVoiceInput = (field: 'pickup' | 'delivery') => {
    setVoiceField(field);
    setIsListening(true);

    // 模拟语音识别
    toast.info("正在识别...", { description: "请说出地址" });
    
    setTimeout(() => {
      const mockAddress = field === 'pickup' 
        ? "深圳市南山区科技园中区科技中二路软件园1栋"
        : "广州市天河区珠江新城花城大道85号";
      
      if (field === 'pickup') {
        setPickupAddress(mockAddress);
      } else {
        setDeliveryAddress(mockAddress);
      }
      
      setIsListening(false);
      setVoiceField(null);
      toast.success("识别成功！");
    }, 2000);
  };

  // 拍照识货（模拟）
  const handlePhotoUpload = () => {
    // 模拟拍照
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // 调用摄像头
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const photoUrl = event.target?.result as string;
          setCargoPhoto(photoUrl);
          
          // 模拟AI识别
          toast.info("正在识别货物...");
          setTimeout(() => {
            setCargoType("纸箱包装货物");
            setWeight("0.5");
            setVolume("2");
            toast.success("识别成功！", { 
              description: "已自动填写货物信息，请确认" 
            });
          }, 1500);
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  // 选择常用地址
  const handleSelectAddress = (address: SavedAddress) => {
    if (showAddressBook === 'pickup') {
      setPickupAddress(address.address);
      setPickupContact(address.contact);
      setPickupPhone(address.phone);
    } else if (showAddressBook === 'delivery') {
      setDeliveryAddress(address.address);
      setDeliveryContact(address.contact);
      setDeliveryPhone(address.phone);
    }
    setShowAddressBook(null);
  };

  // 保存地址到常用
  const saveCurrentAddress = (type: 'pickup' | 'delivery') => {
    const newAddress: SavedAddress = {
      id: `ADDR_${Date.now()}`,
      label: type === 'pickup' ? '取货地址' : '收货地址',
      address: type === 'pickup' ? pickupAddress : deliveryAddress,
      contact: type === 'pickup' ? pickupContact : deliveryContact,
      phone: type === 'pickup' ? pickupPhone : deliveryPhone,
    };
    
    const updated = [...savedAddresses, newAddress].slice(-10); // 最多保存10个
    setSavedAddresses(updated);
    storage.set(STORAGE_KEYS.SAVED_ADDRESSES, updated);
    toast.success("已保存到常用地址");
  };

  // Step 1 验证
  const validateStep1 = (): boolean => {
    if (!pickupAddress.trim() || pickupAddress.length < 5) {
      toast.error("请输入完整的取货地址");
      return false;
    }
    if (!deliveryAddress.trim() || deliveryAddress.length < 5) {
      toast.error("请输入完整的收货地址");
      return false;
    }
    return true;
  };

  // Step 2 验证
  const validateStep2 = (): boolean => {
    if (!cargoType.trim()) {
      toast.error("请输入货物类型");
      return false;
    }
    const weightNum = parseFloat(weight);
    if (!weight || isNaN(weightNum) || weightNum <= 0 || weightNum > 100) {
      toast.error("请输入有效的货物重量（0.1-100吨）");
      return false;
    }
    if (!recommendedVehicle) {
      toast.error("无法推荐合适车型，请检查货物信息");
      return false;
    }
    return true;
  };

  // Step 3 验证
  const validateStep3 = (): boolean => {
    if (!pickupContact.trim() || !/^[\u4e00-\u9fa5a-zA-Z\s]{2,20}$/.test(pickupContact)) {
      toast.error("请输入有效的取货联系人姓名");
      return false;
    }
    if (!/^1[3-9]\d{9}$/.test(pickupPhone)) {
      toast.error("请输入有效的取货联系电话");
      return false;
    }
    if (!deliveryContact.trim() || !/^[\u4e00-\u9fa5a-zA-Z\s]{2,20}$/.test(deliveryContact)) {
      toast.error("请输入有效的收货联系人姓名");
      return false;
    }
    if (!/^1[3-9]\d{9}$/.test(deliveryPhone)) {
      toast.error("请输入有效的收货联系电话");
      return false;
    }
    return true;
  };

  // 下一步
  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      handleSubmit();
    }
  };

  // 上一步
  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3);
    }
  };

  // 提交订单
  const handleSubmit = () => {
    if (!recommendedVehicle || !priceBreakdown) return;

    const orderData: Order = {
      id: `ORD${Date.now()}`,
      orderNumber: generateOrderNumber(),
      contractNumber: generateContractNumber(),
      route: `${extractCity(pickupAddress)}-${extractCity(deliveryAddress)}`,
      fromCity: extractCity(pickupAddress),
      toCity: extractCity(deliveryAddress),
      createTime: getCurrentTime(),
      
      cargoType,
      weight: parseFloat(weight),
      
      vehicleType: recommendedVehicle.name,
      vehicleLength: recommendedVehicle.length,
      vehicleWidth: recommendedVehicle.width,
      vehicleHeight: recommendedVehicle.height,
      vehicleCapacity: recommendedVehicle.capacity,
      
      pickupAddress,
      pickupContact,
      pickupPhone,
      pickupTime,
      deliveryAddress,
      deliveryContact,
      deliveryPhone,
      
      paymentMethod,
      pricingMethod,
      price: priceBreakdown.total,
      fixedPrice: pricingMethod === "fixed" ? priceBreakdown.total : undefined,
      
      status: "published",
    };

    onSubmit(orderData);
    showToast("ORDER_SUBMITTED");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FF6034] to-[#FF4444] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6" />
            <div>
              <h2 className="font-bold text-lg">快速发货</h2>
              <p className="text-xs text-white/80">3步完成，5分钟搞定</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* 进度条 */}
        <div className="bg-gray-50 px-4 py-3 border-b">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[
              { num: 1, label: "地址" },
              { num: 2, label: "货物" },
              { num: 3, label: "确认" },
            ].map((s, index) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step >= s.num
                        ? "bg-[#FF6034] text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={`text-xs mt-1 ${step >= s.num ? "text-[#FF6034] font-bold" : "text-gray-400"}`}>
                    {s.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`w-16 h-0.5 mx-2 ${step > s.num ? "bg-[#FF6034]" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 内容区域 */}
        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step 1: 从哪到哪 */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">从哪里发货到哪里？</h3>
                <p className="text-sm text-gray-500">请填写取货和收货地址</p>
              </div>

              {/* 取货地址 */}
              <div className="space-y-3">
                <Label className="text-base font-bold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#FF6034]" />
                  取货地址
                </Label>
                <div className="relative">
                  <Input
                    placeholder="请输入详细地址，如：深圳市南山区科技园..."
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="pr-20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleVoiceInput('pickup')}
                      className="h-7 px-2"
                    >
                      <Mic className={`w-4 h-4 ${isListening && voiceField === 'pickup' ? 'text-red-500 animate-pulse' : ''}`} />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowAddressBook('pickup')}
                      className="h-7 px-2 text-[#FF6034]"
                    >
                      常用
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  提示：可以点击麦克风图标语音输入地址
                </p>
              </div>

              {/* 收货地址 */}
              <div className="space-y-3">
                <Label className="text-base font-bold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  收货地址
                </Label>
                <div className="relative">
                  <Input
                    placeholder="请输入详细地址，如：广州市天河区珠江新城..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="pr-20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleVoiceInput('delivery')}
                      className="h-7 px-2"
                    >
                      <Mic className={`w-4 h-4 ${isListening && voiceField === 'delivery' ? 'text-red-500 animate-pulse' : ''}`} />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowAddressBook('delivery')}
                      className="h-7 px-2 text-[#FF6034]"
                    >
                      常用
                    </Button>
                  </div>
                </div>
              </div>

              {/* 常用地址选择 */}
              {showAddressBook && savedAddresses.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-sm">选择常用地址</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAddressBook(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr)}
                          className="w-full text-left p-3 bg-white rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <div className="font-medium text-sm">{addr.label}</div>
                          <div className="text-xs text-gray-600 mt-1">{addr.address}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {addr.contact} {addr.phone}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 2: 什么货 */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">是什么货物？</h3>
                <p className="text-sm text-gray-500">告诉我们货物信息，我们会推荐合适的车型</p>
              </div>

              {/* 拍照识货 */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-dashed border-purple-300 rounded-xl p-4">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-bold text-purple-900 mb-1">拍照识货（智能）</h4>
                  <p className="text-xs text-purple-700 mb-3">
                    拍张照片，AI自动识别货物类型和重量
                  </p>
                  <Button
                    type="button"
                    onClick={handlePhotoUpload}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    立即拍照
                  </Button>
                </div>
                {cargoPhoto && (
                  <div className="mt-4">
                    <img src={cargoPhoto} alt="货物照片" className="w-full h-32 object-cover rounded-lg" />
                  </div>
                )}
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">或手动填写</span>
                </div>
              </div>

              {/* 货物类型 */}
              <div className="space-y-2">
                <Label>货物类型</Label>
                <Input
                  placeholder="如：纸箱、家具、电器、服装等"
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                />
              </div>

              {/* 货物重量 */}
              <div className="space-y-2">
                <Label>大概多重？（吨）</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="如：0.5 表示半吨（500公斤）"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  💡 提示：1吨 = 1000公斤 = 2000斤
                </p>
              </div>

              {/* 货物体积（可选）*/}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  大概多大？（立方米）
                  <span className="text-xs text-gray-400">选填</span>
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="如：2 表示2立方米"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  💡 参考：轿车后备箱约0.5方，小面包车约3-5方
                </p>
              </div>

              {/* 智能推荐车型 */}
              {recommendedVehicle && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-6 h-6 text-green-600 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-bold text-green-900 mb-2">为您推荐车型</h4>
                        <div className="bg-white rounded-lg p-3 mb-2">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Truck className="w-5 h-5 text-[#FF6034]" />
                              <span className="font-bold">{recommendedVehicle.name}</span>
                            </div>
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                              最合适
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>车长：{recommendedVehicle.length}米</div>
                            <div>载重：{recommendedVehicle.capacity}吨（能装您的货）</div>
                            <div>容积：{recommendedVehicle.volume}立方米</div>
                          </div>
                        </div>
                        <p className="text-xs text-green-700">
                          ✓ 根据您的货物自动匹配，保证能装下
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 3: 确认信息 */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">确认信息并下单</h3>
                <p className="text-sm text-gray-500">请补充联系人信息</p>
              </div>

              {/* 取货联系人 */}
              <Card className="border-[#FF6034]/20">
                <CardContent className="p-4">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#FF6034]" />
                    取货联系人
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <Label>联系人</Label>
                      <Input
                        placeholder="如：张三"
                        value={pickupContact}
                        onChange={(e) => setPickupContact(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>联系电话</Label>
                      <Input
                        placeholder="如：13800138000"
                        value={pickupPhone}
                        onChange={(e) => setPickupPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>取货时间</Label>
                      <select
                        className="w-full border rounded-md p-2 text-sm"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                      >
                        <option>立即发货</option>
                        <option>今天下午</option>
                        <option>明天上午</option>
                        <option>明天下午</option>
                      </select>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => saveCurrentAddress('pickup')}
                  >
                    保存到常用地址
                  </Button>
                </CardContent>
              </Card>

              {/* 收货联系人 */}
              <Card className="border-blue-600/20">
                <CardContent className="p-4">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    收货联系人
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <Label>联系人</Label>
                      <Input
                        placeholder="如：李四"
                        value={deliveryContact}
                        onChange={(e) => setDeliveryContact(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>联系电话</Label>
                      <Input
                        placeholder="如：13900139000"
                        value={deliveryPhone}
                        onChange={(e) => setDeliveryPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => saveCurrentAddress('delivery')}
                  >
                    保存到常用地址
                  </Button>
                </CardContent>
              </Card>

              {/* 运费支付方式 */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-bold mb-3">运费由谁支付？</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod("prepaid")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === "prepaid"
                          ? "border-[#FF6034] bg-[#FF6034]/10"
                          : "border-gray-200 hover:border-[#FF6034]/50"
                      }`}
                    >
                      <div className="text-center">
                        <div className={`font-bold mb-1 ${paymentMethod === "prepaid" ? "text-[#FF6034]" : ""}`}>
                          我支付
                        </div>
                        <div className="text-xs text-gray-600">发货时付钱</div>
                        <div className="text-xs text-green-600 mt-1">✓ 推荐</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("collect")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === "collect"
                          ? "border-[#FF6034] bg-[#FF6034]/10"
                          : "border-gray-200 hover:border-[#FF6034]/50"
                      }`}
                    >
                      <div className="text-center">
                        <div className={`font-bold mb-1 ${paymentMethod === "collect" ? "text-[#FF6034]" : ""}`}>
                          对方支付
                        </div>
                        <div className="text-xs text-gray-600">收货时付钱</div>
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* 报价方式 */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-bold mb-2">选择报价方式</h4>
                  <p className="text-xs text-gray-500 mb-3">选择最适合您的方式</p>
                  <div className="space-y-3">
                    <button
                      onClick={() => setPricingMethod("fixed")}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        pricingMethod === "fixed"
                          ? "border-[#FF6034] bg-[#FF6034]/10"
                          : "border-gray-200 hover:border-[#FF6034]/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className={`font-bold mb-1 ${pricingMethod === "fixed" ? "text-[#FF6034]" : ""}`}>
                            立即确定价格
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                            马上有司机接单，2分钟内响应
                          </div>
                          {priceBreakdown && (
                            <div className="text-sm font-bold text-[#FF6034]">
                              预估运费：¥{priceBreakdown.total.toFixed(0)}
                            </div>
                          )}
                        </div>
                        <Badge className="bg-green-500 text-white">推荐</Badge>
                      </div>
                    </button>
                    <button
                      onClick={() => setPricingMethod("bidding")}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        pricingMethod === "bidding"
                          ? "border-[#FF6034] bg-[#FF6034]/10"
                          : "border-gray-200 hover:border-[#FF6034]/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className={`font-bold mb-1 ${pricingMethod === "bidding" ? "text-[#FF6034]" : ""}`}>
                            多个司机报价
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                            等待30分钟，可能更便宜，但需要等
                          </div>
                          {priceBreakdown && (
                            <div className="text-sm text-gray-600">
                              可能节省：¥{Math.floor(priceBreakdown.total * 0.1)} - ¥{Math.floor(priceBreakdown.total * 0.2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* 价格明细 */}
              {priceBreakdown && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                        价格明细
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPriceDetail(!showPriceDetail)}
                      >
                        {showPriceDetail ? "收起" : "展开"}
                      </Button>
                    </div>
                    
                    {showPriceDetail && (
                      <div className="space-y-2 mb-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">基础运费</span>
                          <span>¥{priceBreakdown.baseFare}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">里程费（约50公里）</span>
                          <span>¥{priceBreakdown.distanceFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">重量费（{weight}吨）</span>
                          <span>¥{priceBreakdown.weightFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">高速费（预估）</span>
                          <span>¥{priceBreakdown.highwayFee}</span>
                        </div>
                        <div className="border-t pt-2 mt-2"></div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>合计</span>
                      <span className="text-[#FF6034]">¥{priceBreakdown.total.toFixed(0)}</span>
                    </div>
                    
                    <div className="mt-3 p-2 bg-white rounded text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        <span>市场参考价：¥{priceBreakdown.marketMin.toFixed(0)} - ¥{priceBreakdown.marketMax.toFixed(0)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>

        {/* 底部按钮 */}
        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              上一步
            </Button>
          )}
          <Button
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-[#FF6034] to-[#FF4444] hover:from-[#FF4444] hover:to-[#FF6034]"
          >
            {step === 3 ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                确认下单
              </>
            ) : (
              <>
                下一步
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}