import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ThumbsUp, Lightbulb, Plus, Minus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

// 🆕 单车配置类型
export interface VehicleConfig {
  length: string;
  style: string;
}

interface VehicleTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: VehicleConfig[]; // 车辆配置数组
  onConfirm: (vehicles: VehicleConfig[]) => void;
  // 智能推荐需要的货物信息
  weightMin?: string;
  weightMax?: string;
  volumeMin?: string;
  volumeMax?: string;
}

// 车长数据（包含载重、尺寸、体积信息）
const VEHICLE_LENGTH_DATA = [
  {
    value: "4.2",
    label: "4.2米",
    capacity: "5吨",
    dimensions: "4.2 × 1.9 × 1.8",
    volume: "14方",
  },
  {
    value: "6.8",
    label: "6.8米",
    capacity: "10吨",
    dimensions: "6.8 × 2.3 × 2.4",
    volume: "37方",
  },
  {
    value: "9.6",
    label: "9.6米",
    capacity: "18吨",
    dimensions: "9.6 × 2.3 × 2.4",
    volume: "53方",
  },
  {
    value: "13",
    label: "13米",
    capacity: "32吨",
    dimensions: "13 × 2.4 × 2.7",
    volume: "84方",
  },
  {
    value: "17.5",
    label: "17.5米",
    capacity: "35吨",
    dimensions: "17.5 × 2.4 × 2.7",
    volume: "113方",
  },
  {
    value: "19.0",
    label: "19.0米",
    capacity: "40吨",
    dimensions: "19 × 2.5 × 3.8",
    volume: "300方",
  },
];

// 车型数据
const VEHICLE_STYLE_DATA = [
  {
    value: "厢式",
    label: "厢式",
    image: "https://images.unsplash.com/photo-1768716697797-5eed4d2173f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3glMjB0cnVjayUyMHNpZGUlMjB2aWV3fGVufDF8fHx8MTc3MDg1ODY1M3ww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    value: "平板",
    label: "平板",
    image: "https://images.unsplash.com/photo-1634756123386-f5fe9b4a2ebe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbGF0YmVkJTIwdHJ1Y2slMjBzaWRlJTIwdmlld3xlbnwxfHx8fDE3NzA4NTg2NTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    value: "高栏",
    label: "高栏",
    image: "https://images.unsplash.com/photo-1667496959916-7e72607d3b6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFrZSUyMHRydWNrJTIwc2lkZSUyMHZpZXd8ZW58MXx8fHwxNzcwODU4NjU0fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

export function VehicleTypeSelector({
  isOpen,
  onClose,
  vehicles,
  onConfirm,
  weightMin,
  weightMax,
  volumeMin,
  volumeMax,
}: VehicleTypeSelectorProps) {
  // 🆕 初始化车辆数和车辆配置
  const [vehicleCount, setVehicleCount] = useState(vehicles.length || 1);
  const [localVehicles, setLocalVehicles] = useState<VehicleConfig[]>(
    vehicles.length > 0 
      ? vehicles 
      : [{ length: "", style: "" }]
  );

  if (!isOpen) return null;

  // 🆕 调整车辆数
  const handleVehicleCountChange = (count: number) => {
    const newCount = Math.max(1, Math.min(10, count)); // 限制1-10辆
    setVehicleCount(newCount);
    
    // 调整车辆配置数组
    if (newCount > localVehicles.length) {
      // 增加车辆
      const newVehicles = [...localVehicles];
      for (let i = localVehicles.length; i < newCount; i++) {
        newVehicles.push({ length: "", style: "" });
      }
      setLocalVehicles(newVehicles);
    } else if (newCount < localVehicles.length) {
      // 减少车辆
      setLocalVehicles(localVehicles.slice(0, newCount));
    }
  };

  // 🆕 更新单个车辆的车长
  const updateVehicleLength = (index: number, length: string) => {
    setLocalVehicles((prev) => {
      const newVehicles = [...prev];
      newVehicles[index] = { ...newVehicles[index], length };
      return newVehicles;
    });
  };

  // 🆕 更新单个车辆的车型
  const updateVehicleStyle = (index: number, style: string) => {
    setLocalVehicles((prev) => {
      const newVehicles = [...prev];
      newVehicles[index] = { ...newVehicles[index], style };
      return newVehicles;
    });
  };

  // 🆕 智能推荐算法（优化多车场景）
  const getSmartRecommendation = () => {
    // 计算总重量（吨）
    let totalWeight = 0;
    if (weightMin || weightMax) {
      const min = parseFloat(weightMin || "0");
      const max = parseFloat(weightMax || weightMin || "0");
      totalWeight = Math.max(min, max);
    } else if (volumeMin || volumeMax) {
      const min = parseFloat(volumeMin || "0");
      const max = parseFloat(volumeMax || volumeMin || "0");
      totalWeight = Math.max(min, max) * 0.4; // 体积转重量（1方≈0.4吨）
    }

    if (totalWeight === 0) {
      return null; // 没有重量或体积信息，不推荐
    }

    // 🔥 智能推荐逻辑
    let recommendedVehicleCount = 1;
    let description = "";
    
    if (totalWeight <= 5) {
      recommendedVehicleCount = 1;
      description = "4.2米×1台";
    } else if (totalWeight <= 10) {
      recommendedVehicleCount = 1;
      description = "6.8米×1台";
    } else if (totalWeight <= 18) {
      recommendedVehicleCount = 1;
      description = "9.6米×1台";
    } else if (totalWeight <= 32) {
      recommendedVehicleCount = 1;
      description = "13米×1台";
    } else if (totalWeight <= 35) {
      recommendedVehicleCount = 1;
      description = "17.5米×1台";
    } else if (totalWeight <= 40) {
      recommendedVehicleCount = 1;
      description = "19米×1台";
    } else if (totalWeight <= 64) {
      recommendedVehicleCount = 2;
      description = "13米×2台";
    } else if (totalWeight <= 70) {
      recommendedVehicleCount = 2;
      description = "17.5米×2台";
    } else if (totalWeight <= 80) {
      recommendedVehicleCount = 2;
      description = "19米×2台";
    } else {
      const count19m = Math.floor(totalWeight / 40);
      const remaining = totalWeight % 40;
      
      if (remaining === 0) {
        recommendedVehicleCount = count19m;
        description = `19米×${count19m}台`;
      } else if (remaining <= 32) {
        recommendedVehicleCount = count19m + 1;
        description = `19米×${count19m}台 + 13米×1台`;
      } else {
        recommendedVehicleCount = count19m + 1;
        description = `19米×${count19m + 1}台`;
      }
    }

    return {
      vehicleCount: recommendedVehicleCount,
      totalWeight: totalWeight.toFixed(1),
      description,
    };
  };

  const recommendation = getSmartRecommendation();

  // 检查是否所有车辆都已配置
  const allVehiclesConfigured = localVehicles.every((v) => v.length && v.style);

  return (
    <>
      {/* 遮罩层 */}
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />

      {/* 主内容 */}
      <div className="fixed inset-x-0 top-0 bottom-0 z-[60] flex flex-col bg-gray-50">
        {/* 顶部导航栏 */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
          <button onClick={onClose} className="p-1">
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h2 className="text-lg font-bold text-gray-900">车型要求</h2>
          <div className="w-6" />
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-hide">
          {/* 🆕 智能推荐卡片 */}
          {recommendation && (
            <Card className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200">
              <div className="flex items-start gap-2.5">
                <div className="shrink-0 w-8 h-8 rounded-full bg-[#FF6034] flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-white fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#FF6034] mb-1.5">智能推荐</h3>
                  <div className="space-y-1 text-xs text-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">货物总重：</span>
                      <span className="font-medium">{recommendation.totalWeight}吨</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">推荐方案：</span>
                      <span className="font-bold text-[#FF6034]">{recommendation.description}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 🆕 车辆数选择 */}
          <Card className="p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">需要车辆数</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleVehicleCountChange(vehicleCount - 1)}
                  disabled={vehicleCount <= 1}
                  className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#FF6034] hover:bg-orange-50 transition-colors"
                >
                  <Minus className="w-4 h-4 text-gray-700" />
                </button>
                <div className="min-w-[60px] text-center">
                  <input
                    type="number"
                    value={vehicleCount}
                    onChange={(e) => handleVehicleCountChange(parseInt(e.target.value) || 1)}
                    className="w-full text-2xl font-bold text-[#FF6034] text-center bg-transparent border-none outline-none"
                    min="1"
                    max="10"
                  />
                  <div className="text-xs text-gray-500 mt-0.5">辆</div>
                </div>
                <button
                  onClick={() => handleVehicleCountChange(vehicleCount + 1)}
                  disabled={vehicleCount >= 10}
                  className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#FF6034] hover:bg-orange-50 transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>
          </Card>

          {/* 🆕 循环显示每辆车的配置 */}
          {localVehicles.map((vehicle, index) => (
            <Card key={index} className="p-3 border-2 border-gray-200">
              {/* 车辆标题 */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900">
                  第 {index + 1} 辆车
                </h3>
                {vehicle.length && vehicle.style && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-green-600 font-medium">已配置</span>
                  </div>
                )}
              </div>

              {/* 车长选择 */}
              <div className="mb-2.5">
                <div className="text-xs text-gray-600 mb-1.5">车长选择</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {VEHICLE_LENGTH_DATA.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => updateVehicleLength(index, item.value)}
                      className={`px-2 py-1.5 rounded-lg border-2 text-xs font-medium transition-all ${
                        vehicle.length === item.value
                          ? "border-[#FF6034] bg-orange-50 text-[#FF6034]"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-sm">{item.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">({item.capacity})</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 车型选择 */}
              <div>
                <div className="text-xs text-gray-600 mb-1.5">车型选择</div>
                <div className="grid grid-cols-3 gap-2">
                  {VEHICLE_STYLE_DATA.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => updateVehicleStyle(index, item.value)}
                      className={`relative rounded-lg border-2 overflow-hidden transition-all ${
                        vehicle.style === item.value
                          ? "border-[#FF6034] bg-orange-50"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      {/* 选中标记 */}
                      {vehicle.style === item.value && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#FF6034] flex items-center justify-center z-10">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}

                      {/* 车型图片 */}
                      <div className="aspect-[4/3] relative bg-white">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.label}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* 车型名称 */}
                      <div className="py-1.5 px-2">
                        <div
                          className={`text-xs font-medium ${
                            vehicle.style === item.value
                              ? "text-[#FF6034]"
                              : "text-gray-700"
                          }`}
                        >
                          {item.label}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* 底部确认按钮 */}
        <div className="bg-white border-t border-gray-200 p-3 shrink-0">
          <Button
            onClick={() => {
              onConfirm(localVehicles);
              onClose();
            }}
            disabled={!allVehiclesConfigured}
            className="w-full h-11 bg-[#FF6034] hover:bg-[#FF6034]/90 text-white font-bold text-base rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            确定 ({vehicleCount}辆车)
          </Button>
        </div>
      </div>
    </>
  );
}
