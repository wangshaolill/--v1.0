import { useState } from "react";
import { X, TrendingUp, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import type { Order } from "@/types/order";
import { getOrderBasePrice } from "@/utils/orderUtils";

interface PriceBoostModalProps {
  order: Order;
  onClose: () => void;
  onConfirm: (orderId: string, newPrice: number) => void;
}

export function PriceBoostModal({ order, onClose, onConfirm }: PriceBoostModalProps) {
  const currentPrice = getOrderBasePrice(order);
  const [selectedBoost, setSelectedBoost] = useState<number | null>(null);
  const [customBoost, setCustomBoost] = useState<string>("");

  // 推荐加价幅度
  const recommendedBoosts = [
    { amount: 100, label: "+¥100", description: "小幅加价", color: "from-blue-500 to-blue-600" },
    { amount: 200, label: "+¥200", description: "中幅加价", color: "from-orange-500 to-orange-600", recommended: true },
    { amount: 300, label: "+¥300", description: "大幅加价", color: "from-red-500 to-red-600" },
  ];

  const handleBoostSelect = (amount: number) => {
    setSelectedBoost(amount);
    setCustomBoost("");
  };

  const handleCustomBoostChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setSelectedBoost(numValue);
      setCustomBoost(value);
    } else {
      setSelectedBoost(null);
      setCustomBoost(value);
    }
  };

  const handleConfirm = () => {
    if (selectedBoost) {
      const newPrice = currentPrice + selectedBoost;
      onConfirm(order.id, newPrice);
      onClose();
    }
  };

  const newPrice = selectedBoost ? currentPrice + selectedBoost : currentPrice;
  const increasePercent = selectedBoost ? Math.round((selectedBoost / currentPrice) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in duration-200">
      <div className="bg-white w-full rounded-t-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* 顶部栏 */}
        <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6034] to-[#FF4444] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">加价叫车</h3>
              <p className="text-xs text-muted-foreground">提高价格吸引更多司机</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* 当前价格显示 */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 mb-1">当前运费</p>
                  <p className="text-2xl font-black text-blue-700">¥{currentPrice.toLocaleString()}</p>
                </div>
                {selectedBoost && (
                  <div className="text-right">
                    <p className="text-xs text-orange-600 mb-1">加价后</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-black text-orange-600">¥{newPrice.toLocaleString()}</p>
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                        +{increasePercent}%
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
              {selectedBoost && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">加价金额：</span>
                    <span className="text-orange-600 font-bold text-lg">+¥{selectedBoost.toLocaleString()}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 提示信息 */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
            <Zap className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs text-orange-700 leading-relaxed">
              <p className="font-medium mb-1">加价提示：</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>加价后订单将重新推送给司机</li>
                <li>建议加价10%-20%获得最佳效果</li>
                <li>加价后不可撤回，请谨慎操作</li>
              </ul>
            </div>
          </div>

          {/* 推荐加价方案 */}
          <div>
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-1">
              推荐加价方案
              <Badge variant="outline" className="text-[10px] border-orange-300 text-orange-600">
                快速选择
              </Badge>
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {recommendedBoosts.map((boost) => (
                <button
                  key={boost.amount}
                  onClick={() => handleBoostSelect(boost.amount)}
                  className={`relative p-3 rounded-xl border-2 transition-all ${
                    selectedBoost === boost.amount
                      ? "border-orange-500 bg-orange-50 shadow-lg scale-105"
                      : "border-gray-200 hover:border-orange-300 hover:shadow-md"
                  }`}
                >
                  {boost.recommended && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] px-2 py-0">
                        推荐
                      </Badge>
                    </div>
                  )}
                  <div className={`text-2xl font-black bg-gradient-to-br ${boost.color} bg-clip-text text-transparent mb-1`}>
                    {boost.label}
                  </div>
                  <p className="text-[10px] text-gray-600">{boost.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ¥{(currentPrice + boost.amount).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 自定义加价 */}
          <div>
            <h4 className="font-semibold text-sm mb-3">自定义加价</h4>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  +¥
                </span>
                <input
                  type="number"
                  value={customBoost}
                  onChange={(e) => handleCustomBoostChange(e.target.value)}
                  placeholder="输入加价金额"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-base font-medium"
                />
              </div>
              {customBoost && selectedBoost && (
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-500">加价后</p>
                  <p className="text-lg font-bold text-orange-600">
                    ¥{newPrice.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 加价效果预估 */}
          {selectedBoost && (
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-sm mb-2 text-orange-900">预估效果</h5>
                    <div className="space-y-1.5 text-xs text-orange-800">
                      <p>• 订单曝光率预计提升 <span className="font-bold text-orange-600">{Math.min(increasePercent * 2, 50)}%</span></p>
                      <p>• 司机接单率预计提升 <span className="font-bold text-orange-600">{Math.min(increasePercent * 3, 80)}%</span></p>
                      <p>• 预计 <span className="font-bold text-orange-600">{Math.ceil(increasePercent / 5)}-{Math.ceil(increasePercent / 3)}</span> 分钟内获得响应</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 警告信息 */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 leading-relaxed">
              <span className="font-medium">重要提醒：</span>
              加价后订单金额将立即生效，确认后无法撤销。请确保加价金额符合您的预算。
            </p>
          </div>

          {/* 底部按钮 */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 h-12"
              onClick={onClose}
            >
              取消
            </Button>
            <Button
              className="flex-1 h-12 bg-gradient-to-r from-[#FF6034] to-[#FF4444] hover:from-[#FF6034]/90 hover:to-[#FF4444]/90 text-white font-bold shadow-lg"
              onClick={handleConfirm}
              disabled={!selectedBoost}
            >
              {selectedBoost ? (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  确认加价 +¥{selectedBoost}
                </>
              ) : (
                "请选择加价方案"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}