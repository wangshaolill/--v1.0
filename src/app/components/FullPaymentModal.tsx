import { useState } from "react";
import { X, Wallet, CreditCard, Check } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { toast } from "sonner";

// 支付方式类型
export type PaymentMethodType = "wechat" | "alipay";

interface FullPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: PaymentMethodType) => void;
  paymentAmount: number;  // 应付金额（全款）
  totalAmount: number;
  orderNumber: string;
  vehicleCount: number;
}

export function FullPaymentModal({
  isOpen,
  onClose,
  onConfirm,
  paymentAmount,
  totalAmount,
  orderNumber,
  vehicleCount,
}: FullPaymentModalProps) {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodType>("wechat");
  const [isPaying, setIsPaying] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsPaying(true);

    // 模拟支付过程（实际应调用支付SDK）
    setTimeout(() => {
      onConfirm(selectedPayment);
      setIsPaying(false);
    }, 1500);
  };

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
          <button onClick={onClose} className="p-1">
            <X className="w-6 h-6 text-gray-600" />
          </button>
          <h2 className="text-lg font-bold text-gray-900">支付运费</h2>
          <div className="w-6" />
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto">
          {/* 订单信息 */}
          <Card className="m-3 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-gray-600 mb-1">订单编号</div>
                <div className="font-mono text-base font-medium text-gray-900">{orderNumber}</div>
              </div>
              <Badge className="bg-orange-100 text-[#FF6034] border-orange-200">
                待支付
              </Badge>
            </div>

            <Separator className="my-3" />

            <div className="space-y-2 text-sm">
              {vehicleCount > 1 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">车辆数量</span>
                  <span className="font-medium text-gray-900">{vehicleCount}台</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">运输费用</span>
                <span className="font-medium text-gray-900">¥{paymentAmount.toLocaleString()}</span>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-gray-900">应付运费</span>
              <span className="text-2xl font-bold text-[#FF6034]">
                ¥{paymentAmount.toLocaleString()}
              </span>
            </div>

            {vehicleCount > 1 && (
              <div className="mt-3 p-2 bg-orange-50 rounded-lg">
                <div className="text-xs text-gray-600">
                  💡 多车运输说明：将生成{vehicleCount}个关联订单，运费将按比例分配
                </div>
              </div>
            )}
          </Card>

          {/* 支付方式选择 */}
          <Card className="m-3 p-4">
            <div className="text-base font-bold text-gray-900 mb-3">选择支付方式</div>

            <div className="space-y-2">
              {/* 微信支付 */}
              <button
                onClick={() => setSelectedPayment("wechat")}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedPayment === "wechat"
                    ? "border-[#FF6034] bg-orange-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">微信支付</div>
                      <div className="text-xs text-gray-500">推荐使用</div>
                    </div>
                  </div>
                  {selectedPayment === "wechat" && (
                    <div className="w-6 h-6 rounded-full bg-[#FF6034] flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>

              {/* 支付宝支付 */}
              <button
                onClick={() => setSelectedPayment("alipay")}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedPayment === "alipay"
                    ? "border-[#FF6034] bg-orange-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">支付宝</div>
                      <div className="text-xs text-gray-500">安全快捷</div>
                    </div>
                  </div>
                  {selectedPayment === "alipay" && (
                    <div className="w-6 h-6 rounded-full bg-[#FF6034] flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            </div>
          </Card>

          {/* 支付说明 */}
          <Card className="m-3 p-4">
            <div className="text-sm font-bold text-gray-900 mb-2">支付说明</div>
            <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside">
              <li>支付成功后订单生效，司机将按约定时间上门装货</li>
              <li>运费将在货物送达后由平台结算给司机</li>
              {vehicleCount > 1 && (
                <li>多车运输将生成{vehicleCount}个关联订单，共享同一合同号</li>
              )}
              <li>如订单取消，运费将在3-5个工作日内原路退回</li>
              <li>支付遇到问题请联系客服：400-xxx-xxxx</li>
            </ul>
          </Card>
        </div>

        {/* 底部支付按钮 */}
        <div className="bg-white border-t border-gray-200 p-3 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-gray-500">应付运费</div>
              <div className="text-xl font-bold text-[#FF6034]">
                ¥{paymentAmount.toLocaleString()}
              </div>
            </div>
            <Button
              onClick={handleConfirm}
              disabled={isPaying}
              className="h-11 px-8 bg-[#FF6034] hover:bg-[#FF6034]/90 text-white font-bold text-base rounded-lg"
            >
              {isPaying ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  支付中...
                </div>
              ) : (
                `确认支付 ¥${paymentAmount.toLocaleString()}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
