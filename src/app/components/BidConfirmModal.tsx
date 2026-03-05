import { X, AlertCircle, Star, Truck } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import type { DriverBid } from "@/types/order";

interface BidConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedBid: DriverBid;
}

export function BidConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  selectedBid,
}: BidConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 主内容 */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[60] bg-white rounded-xl shadow-2xl max-w-sm mx-auto">
        {/* 顶部 */}
        <div className="relative p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 pr-8">
            确认选择司机
          </h2>
        </div>

        {/* 内容 */}
        <div className="p-4 space-y-4">
          {/* 警告提示 */}
          <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <AlertCircle className="w-5 h-5 text-[#FF6034] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-1">
                请仔细确认以下信息
              </p>
              <p className="text-xs text-gray-600">
                选择后不可更改，司机需在10分钟内确认接单
              </p>
            </div>
          </div>

          {/* 司机信息卡片 */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            {/* 司机姓名和评分 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6034] to-orange-500 flex items-center justify-center text-white font-bold">
                  {selectedBid.driverName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {selectedBid.driverName}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs text-gray-600">
                      {selectedBid.rating.toFixed(1)} 分
                    </span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-600">
                      {selectedBid.orderCount} 单
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 车辆信息 */}
            <div className="flex items-center gap-2 mb-2 text-sm text-gray-700">
              <Truck className="w-4 h-4 text-gray-500" />
              <span>{selectedBid.vehicleInfo}</span>
            </div>
            <div className="text-sm text-gray-700 mb-2">
              车牌号：{selectedBid.vehicleNumber}
            </div>
            <div className="text-sm text-gray-700">
              电话：{selectedBid.driverPhone}
            </div>
          </div>

          {/* 报价金额 */}
          <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border-2 border-[#FF6034]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">运费报价</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#FF6034]">
                  ¥{selectedBid.price.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  全额运费
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-4 border-t border-gray-200 flex gap-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            取消
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-[#FF6034] hover:bg-[#FF6034]/90 text-white font-bold"
          >
            确认选择
          </Button>
        </div>
      </div>
    </>
  );
}
