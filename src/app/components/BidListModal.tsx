import { useState } from "react";
import { X, Star, TrendingUp, Award, Phone, Truck } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import type { DriverBid } from "@/types/order";

interface BidListModalProps {
  isOpen: boolean;
  onClose: () => void;
  bids: DriverBid[];
  onSelectBid: (bidId: string) => void;
  minAcceptablePrice?: number; // 最低接受价（用于过滤）
}

type SortType = "price" | "rating" | "comprehensive";

export function BidListModal({
  isOpen,
  onClose,
  bids,
  onSelectBid,
  minAcceptablePrice,
}: BidListModalProps) {
  const [sortType, setSortType] = useState<SortType>("comprehensive");

  if (!isOpen) return null;

  // 过滤低于最低接受价的报价
  const filteredBids = bids.filter(
    (bid) => !minAcceptablePrice || bid.price >= minAcceptablePrice
  );

  // 排序逻辑
  const sortedBids = [...filteredBids].sort((a, b) => {
    if (sortType === "price") {
      return a.price - b.price; // 价格从低到高
    } else if (sortType === "rating") {
      return b.rating - a.rating; // 评分从高到低
    } else {
      // 综合推荐：考虑价格和信用分
      const scoreA = (5 - a.rating) * 200 + a.price; // 评分低的惩罚
      const scoreB = (5 - b.rating) * 200 + b.price;
      return scoreA - scoreB;
    }
  });

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
          <h2 className="text-lg font-bold text-gray-900">
            司机报价 ({filteredBids.length})
          </h2>
          <button onClick={onClose} className="p-1">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* 排序切换 */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">排序：</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSortType("comprehensive")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  sortType === "comprehensive"
                    ? "bg-[#FF6034] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                综合推荐
              </button>
              <button
                onClick={() => setSortType("price")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  sortType === "price"
                    ? "bg-[#FF6034] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                价格优先
              </button>
              <button
                onClick={() => setSortType("rating")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  sortType === "rating"
                    ? "bg-[#FF6034] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                信用优先
              </button>
            </div>
          </div>
        </div>

        {/* 报价列表 */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {sortedBids.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">暂无符合条件的报价</p>
              {minAcceptablePrice && (
                <p className="text-xs mt-2">
                  当前最低接受价：¥{minAcceptablePrice.toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            sortedBids.map((bid, index) => (
              <div
                key={bid.id}
                className="bg-white rounded-lg p-3 border-2 border-gray-200 hover:border-[#FF6034] transition-colors"
              >
                {/* 推荐标签 */}
                {sortType === "comprehensive" && index === 0 && (
                  <div className="mb-2">
                    <Badge className="bg-gradient-to-r from-[#FF6034] to-orange-500 text-white text-xs">
                      🏆 综合推荐
                    </Badge>
                  </div>
                )}

                {/* 司机信息 */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-base">
                        {bid.driverName}
                      </h3>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {bid.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>已完成 {bid.orderCount} 单</span>
                      {bid.orderCount > 100 && (
                        <Badge variant="outline" className="text-xs py-0 h-4 border-green-500 text-green-700">
                          <Award className="w-2.5 h-2.5 mr-1" />
                          金牌司机
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* 报价金额 */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#FF6034]">
                      ¥{bid.price.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {bid.bidTime}
                    </div>
                  </div>
                </div>

                {/* 车辆信息 */}
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                  <Truck className="w-4 h-4" />
                  <span>{bid.vehicleInfo}</span>
                  <span className="text-gray-400">·</span>
                  <span>{bid.vehicleNumber}</span>
                </div>

                {/* 联系方式 */}
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{bid.driverPhone}</span>
                </div>

                {/* 操作按钮 */}
                <Button
                  onClick={() => onSelectBid(bid.id)}
                  className="w-full bg-[#FF6034] hover:bg-[#FF6034]/90 text-white font-bold"
                >
                  选择此司机
                </Button>
              </div>
            ))
          )}
        </div>

        {/* 提示信息 */}
        {filteredBids.length > 0 && (
          <div className="bg-blue-50 border-t border-blue-200 px-4 py-2 shrink-0">
            <p className="text-xs text-blue-700">
              💡 提示：选择司机后，司机需在10分钟内确认接单，否则订单将自动取消
            </p>
          </div>
        )}
      </div>
    </>
  );
}
