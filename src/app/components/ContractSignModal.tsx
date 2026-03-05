import { CheckCircle2, AlertCircle, X, FileText } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import type { Order } from "@/types/order";
import { getOrderPrice } from "@/utils/orderUtils";

interface ContractSignModalProps {
  order: Order;
  onConfirm: () => void;  // 修正：统一使用onConfirm
  onClose: () => void;
}

export function ContractSignModal({ order, onConfirm, onClose }: ContractSignModalProps) {
  const finalPrice = getOrderPrice(order);  // 使用统一的价格获取函数
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* 头部 */}
        <div className="shrink-0 bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white mb-1">签署电子合同</h2>
              <p className="text-sm text-purple-100">{order.route}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* 合同内容 */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="bg-white rounded-2xl p-5 border-2 border-purple-200 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900">货运电子合同</h4>
                <p className="text-xs text-gray-600">合同编号：{order.contractNumber}</p>
              </div>
            </div>
            
            <div className="space-y-2.5 bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">甲方（货主）</span>
                <span className="font-medium">{order.pickupContact}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">乙方（司机）</span>
                <span className="font-medium">{order.driverName || "待确认"}</span>
              </div>
              <div className="h-px bg-gray-200 my-2"></div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">运输路线</span>
                <span className="font-medium">{order.route}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">货物类型</span>
                <span className="font-medium">{order.cargoType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">货物重量</span>
                <span className="font-medium">{order.weight}吨</span>
              </div>
              {order.vehicleType && (
                <>
                  <div className="h-px bg-gray-200 my-2"></div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">车型要求</span>
                    <span className="font-medium">{order.vehicleType}</span>
                  </div>
                  {order.vehicleCapacity && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">载重</span>
                      <span className="font-medium">{order.vehicleCapacity}吨</span>
                    </div>
                  )}
                  {order.vehicleLength && order.vehicleWidth && order.vehicleHeight && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">车辆尺寸</span>
                      <span className="font-medium text-xs">
                        {order.vehicleLength}m × {order.vehicleWidth}m × {order.vehicleHeight}m
                      </span>
                    </div>
                  )}
                </>
              )}
              <div className="h-px bg-gray-200 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">运费金额</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-gray-500">¥</span>
                  <span className="text-2xl font-black text-purple-600">{finalPrice.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">付款方式</span>
                <Badge className={order.paymentMethod === "prepaid" ? "bg-blue-500" : "bg-green-500"}>
                  {order.paymentMethod === "prepaid" ? "寄付" : "到付"}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">报价方式</span>
                <Badge className={order.pricingMethod === "fixed" ? "bg-purple-500" : "bg-orange-500"}>
                  {order.pricingMethod === "fixed" ? "一口价" : "限时竞价"}
                </Badge>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5">
              <h5 className="font-bold text-sm text-gray-900 mb-2.5 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                合同条款（摘要）
              </h5>
              <ul className="text-xs text-gray-700 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>双方应遵守国家相关法律法规及货运行业规范</li>
                <li>货主应确保货物信息真实准确，如实告知特殊要求</li>
                <li>司机应按约定时间完成运输任务，确保货物安全</li>
                <li>运输过程中如发生货损，按保险条款进行理赔</li>
                <li>如有纠纷，双方应友好协商解决，协商不成可申请仲裁</li>
                <li>本合同经双方电子签名后立即生效，具有法律效力</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* 底部按钮 */}
        <div className="shrink-0 p-5 bg-white border-t rounded-b-2xl">
          <Button
            className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-base shadow-lg transition-all active:scale-95"
            onClick={onConfirm}
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            {order.paymentMethod === "prepaid" ? "确认签署并支付" : "确认签署（到付）"}
          </Button>
        </div>
      </div>
    </div>
  );
}