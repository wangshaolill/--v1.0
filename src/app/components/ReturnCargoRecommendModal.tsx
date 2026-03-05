import { useState } from "react";
import { X, ArrowRight, Zap, TrendingDown, Clock, Star, Shield, Award, Phone, Truck } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Avatar } from "@/app/components/ui/avatar";
import { motion, AnimatePresence } from "motion/react";

// 回程配货车辆数据类型
export interface ReturnCargoVehicle {
  id: string;
  route: string;
  from: string;
  to: string;
  vehicleInfo: string;
  capacity: string;
  price: number;
  originalPrice: number;
  rating: number;
  orderCount: number;
  driverName: string;
  driverPhone?: string;
  vehicleNumber?: string;
  distance: string;
  estimatedTime: string;
  isVerified: boolean;
  discount: number;
  tags: string[];
  countdownMinutes?: number;
  cargoPreference?: string[];
}

interface ReturnCargoRecommendModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedVehicles: ReturnCargoVehicle[];
  fromCity: string;
  toCity: string;
  onSelectReturnCargo: (vehicle: ReturnCargoVehicle) => void;
  onContinueNormalOrder: () => void;
}

export function ReturnCargoRecommendModal({
  isOpen,
  onClose,
  matchedVehicles,
  fromCity,
  toCity,
  onSelectReturnCargo,
  onContinueNormalOrder,
}: ReturnCargoRecommendModalProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<ReturnCargoVehicle | null>(null);

  if (!isOpen || matchedVehicles.length === 0) return null;

  // 计算最大节省金额
  const maxSaving = Math.max(...matchedVehicles.map(v => v.originalPrice - v.price));
  
  // 格式化倒计时
  const formatCountdown = (minutes?: number) => {
    if (!minutes) return "";
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分` : `${hours}小时`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
        {/* 背景点击关闭 */}
        <div 
          className="absolute inset-0" 
          onClick={onClose}
        />
        
        {/* 主弹窗内容 */}
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full md:max-w-2xl bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
        >
          {/* 顶部拖拽条（移动端） */}
          <div className="md:hidden flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* 头部 - 橙色渐变背景 */}
          <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 text-white px-6 pt-4 pb-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-6 h-6 fill-current animate-pulse" />
              <h2 className="text-xl font-bold">发现更优惠的回程配货！</h2>
            </div>
            <p className="text-orange-50 text-sm">
              为您找到 <span className="font-bold text-white">{matchedVehicles.length}</span> 辆{" "}
              <span className="font-bold">{fromCity} → {toCity}</span> 的回程空车
            </p>
            
            {/* 优惠卡片 */}
            <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white rounded-full p-2">
                    <TrendingDown className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-xs text-orange-50">最高可节省</div>
                    <div className="text-2xl font-bold">¥{maxSaving}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-orange-50">预计节省</div>
                  <div className="text-lg font-bold">{Math.round((maxSaving / matchedVehicles[0].originalPrice) * 100)}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* 车辆列表 */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {matchedVehicles.map((vehicle) => (
              <Card
                key={vehicle.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                  selectedVehicle?.id === vehicle.id
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300"
                }`}
                onClick={() => setSelectedVehicle(vehicle)}
              >
                <div className="p-4">
                  {/* 顶部：司机信息 & 折扣标签 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600">
                        <div className="text-white font-bold text-sm">
                          {vehicle.driverName.charAt(0)}
                        </div>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-gray-900">{vehicle.driverName}</span>
                          {vehicle.isVerified && (
                            <Shield className="w-4 h-4 text-blue-500 fill-current" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
                          <span>{vehicle.rating}</span>
                          <span className="mx-1">·</span>
                          <span>{vehicle.orderCount}单</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 折扣标签 */}
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                      省¥{vehicle.originalPrice - vehicle.price}
                    </div>
                  </div>

                  {/* 车辆信息 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Truck className="w-4 h-4" />
                      <span>{vehicle.vehicleInfo}</span>
                      <span className="text-gray-400">·</span>
                      <span>{vehicle.capacity}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {vehicle.distance} · {vehicle.estimatedTime}
                    </div>
                  </div>

                  {/* 标签 */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {vehicle.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs bg-orange-100 text-orange-700 border-orange-200"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {vehicle.countdownMinutes && (
                      <Badge variant="outline" className="text-xs border-red-300 text-red-600">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatCountdown(vehicle.countdownMinutes)}后发车
                      </Badge>
                    )}
                  </div>

                  {/* 货物偏好 */}
                  {vehicle.cargoPreference && vehicle.cargoPreference.length > 0 && (
                    <div className="text-xs text-gray-500 mb-3">
                      <span className="mr-1">适运：</span>
                      {vehicle.cargoPreference.join("、")}
                    </div>
                  )}

                  {/* 底部：价格 */}
                  <div className="flex items-end justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-end gap-2">
                      <div className="text-2xl font-bold text-orange-500">
                        ¥{vehicle.price}
                      </div>
                      <div className="text-sm text-gray-400 line-through mb-0.5">
                        ¥{vehicle.originalPrice}
                      </div>
                      <div className="text-xs text-orange-600 font-semibold mb-0.5">
                        {vehicle.discount}折
                      </div>
                    </div>
                    
                    {selectedVehicle?.id === vehicle.id && (
                      <div className="flex items-center gap-1 text-orange-500 text-sm font-semibold">
                        <span>已选择</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* 底部操作按钮 */}
          <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-3">
            <Button
              onClick={() => {
                if (selectedVehicle) {
                  onSelectReturnCargo(selectedVehicle);
                  onClose();
                }
              }}
              disabled={!selectedVehicle}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {selectedVehicle ? (
                <span className="flex items-center gap-2">
                  使用回程配货（省¥{selectedVehicle.originalPrice - selectedVehicle.price}）
                  <ArrowRight className="w-5 h-5" />
                </span>
              ) : (
                "请先选择一辆车"
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                onContinueNormalOrder();
                onClose();
              }}
              className="w-full h-10 text-gray-600 border-gray-300 hover:bg-gray-100"
            >
              不需要，继续正常发货
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              💡 提示：回程配货价格优惠，司机已认证，平台担保交易
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
