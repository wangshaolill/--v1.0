import { CreditCard, X, AlertCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import type { Order } from "@/types/order";
import { getOrderPrice } from "@/utils/orderUtils";

interface PaymentModalProps {
  order: Order;
  onConfirm: () => void;  // 统一使用onConfirm
  onClose: () => void;
}

export function PaymentModal({ order, onConfirm, onClose }: PaymentModalProps) {
  const handlePayment = (method: "wechat" | "alipay" | "bank") => {
    const methodName = 
      method === "wechat" ? "微信支付" :
      method === "alipay" ? "支付宝支付" :
      "银行卡支付";
    
    // 模拟支付过程（无Toast）
    setTimeout(() => {
      onConfirm();  // 直接调用完成回调，由父组件处理Toast
      onClose();    // 关闭支付弹窗
    }, 500);  // 缩短延迟到500ms
  };

  const price = getOrderPrice(order);  // 使用统一的价格获取函数

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* 头部 */}
        <div className="shrink-0 bg-gradient-to-r from-green-500 to-emerald-500 px-5 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white mb-1">支付运费</h2>
              <p className="text-sm text-green-100">{order.route}</p>
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
        
        {/* 支付内容 */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="bg-white rounded-2xl p-6 border-2 border-green-200 shadow-md mb-5">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-2">应付运费</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-black text-green-600">¥</span>
                <span className="text-5xl font-black text-green-600">{price.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-14 flex items-center justify-between border-2 border-green-300 hover:bg-green-50 transition-all active:scale-95"
                onClick={() => handlePayment("wechat")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">微</span>
                  </div>
                  <span className="font-bold text-gray-900">微信支付</span>
                </div>
                <Badge className="bg-green-500 text-white">推荐</Badge>
              </Button>
              
              <Button
                variant="outline"
                className="w-full h-14 flex items-center justify-between border-2 border-blue-300 hover:bg-blue-50 transition-all active:scale-95"
                onClick={() => handlePayment("alipay")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">支</span>
                  </div>
                  <span className="font-bold text-gray-900">支付宝支付</span>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="w-full h-14 flex items-center justify-between border-2 border-purple-300 hover:bg-purple-50 transition-all active:scale-95"
                onClick={() => handlePayment("bank")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-gray-900">银行卡支付</span>
                </div>
              </Button>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5">
            <h5 className="font-bold text-sm text-gray-900 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              支付说明
            </h5>
            <ul className="text-xs text-gray-700 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>支付完成后，订单将转为运单，司机将在预约时间上门取货</li>
              <li>您可以在"运单"模块实时查看物流进度</li>
              <li>支持7天无理由退款（未发货状态）</li>
              <li>如有问题，请联系客服：400-xxx-xxxx</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}