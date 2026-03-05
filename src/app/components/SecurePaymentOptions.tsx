/**
 * 安全支付方式选择组件
 * 解决货到付款收货人恶意不付款的问题
 */

import { Shield, Lock, CreditCard, Clock, AlertCircle, CheckCircle, Info, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";

export type SecurePaymentType = 
  | "prepaid"              // 寄付（发货人付）
  | "collect_prepaid"      // 到付-预授权（平台担保，推荐）
  | "collect_deposit"      // 到付-定金制
  | "collect_traditional"; // 到付-传统（风险高）

interface PaymentOption {
  type: SecurePaymentType;
  name: string;
  shortDesc: string;
  recommend?: boolean;
  risk: "low" | "medium" | "high";
  steps: string[];
  features: string[];
  icon: React.ReactNode;
  badge?: string;
}

interface SecurePaymentOptionsProps {
  selectedType: SecurePaymentType;
  onSelect: (type: SecurePaymentType) => void;
  totalAmount: number;
}

export function SecurePaymentOptions({ selectedType, onSelect, totalAmount }: SecurePaymentOptionsProps) {
  
  const paymentOptions: PaymentOption[] = [
    {
      type: "prepaid",
      name: "我先付款",
      shortDesc: "发货时付款，司机优先配送",
      risk: "low",
      icon: <CreditCard className="w-5 h-5" />,
      steps: [
        "1. 下单时立即支付运费",
        "2. 司机取货运输",
        "3. 货物送达收货人",
      ],
      features: [
        "✓ 司机优先接单，配送更快",
        "✓ 无需担心收货人付款",
        "✓ 平台全程监控物流",
      ],
    },
    {
      type: "collect_prepaid",
      name: "对方付款（平台担保）",
      shortDesc: "收货人付，但平台先冻结资金保障",
      recommend: true,
      risk: "low",
      badge: "最安全",
      icon: <Shield className="w-5 h-5" />,
      steps: [
        "1. 收货人下单时平台冻结运费（不扣款）",
        "2. 司机运输，您可实时跟踪",
        "3. 货到后收货人验货确认",
        "4. 平台自动解冻并支付给司机",
        "5. 如有纠纷，平台介入处理",
      ],
      features: [
        "✓ 平台预先冻结资金，保证司机收到钱",
        "✓ 收货人恶意拒付？平台直接扣款",
        "✓ 货损货丢？平台先行赔付",
        "✓ 全程有保障，零风险",
      ],
    },
    {
      type: "collect_deposit",
      name: "对方付款（定金制）",
      shortDesc: "收货人先付30%定金，货到付70%",
      risk: "medium",
      badge: "较安全",
      icon: <Clock className="w-5 h-5" />,
      steps: [
        "1. 收货人下单时支付30%定金",
        "2. 司机运输货物",
        "3. 货到后收货人验货",
        "4. 收货人支付剩余70%货款",
      ],
      features: [
        "✓ 定金锁定订单，降低违约风险",
        "✓ 收货人恶意拒付，定金不退",
        "✓ 余款可协商，灵活性高",
      ],
    },
    {
      type: "collect_traditional",
      name: "对方付款（传统方式）",
      shortDesc: "货到后收货人直接付现金",
      risk: "high",
      icon: <AlertCircle className="w-5 h-5" />,
      steps: [
        "1. 司机运输货物",
        "2. 货到后收货人验货",
        "3. 收货人直接付现金给司机",
      ],
      features: [
        "⚠ 收货人可能拒付，司机白跑",
        "⚠ 纠纷难处理，维权困难",
        "⚠ 不推荐使用",
      ],
    },
  ];

  const getRiskColor = (risk: "low" | "medium" | "high") => {
    switch (risk) {
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
    }
  };

  const getRiskText = (risk: "low" | "medium" | "high") => {
    switch (risk) {
      case "low":
        return "安全";
      case "medium":
        return "中等风险";
      case "high":
        return "高风险";
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">运费由谁支付？</h3>
        <p className="text-sm text-gray-500">选择安全的支付方式，保障您的权益</p>
      </div>

      {/* 推荐方案高亮 */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-bold text-blue-900 mb-1">推荐：平台担保付款</h4>
              <p className="text-sm text-blue-700">
                <strong>解决您的担忧：</strong>收货人下单时平台先冻结运费，货到验收后自动支付。
                即使收货人恶意拒付，平台也会强制扣款保障司机权益。<strong>您完全不用担心！</strong>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 支付方式选项 */}
      <div className="space-y-3">
        {paymentOptions.map((option) => {
          const isSelected = selectedType === option.type;
          const isRecommended = option.recommend;
          
          return (
            <button
              key={option.type}
              onClick={() => onSelect(option.type)}
              className={`w-full text-left transition-all duration-200 ${
                isSelected
                  ? "ring-2 ring-[#FF6034] ring-offset-2"
                  : "hover:bg-gray-50"
              }`}
            >
              <Card className={`${
                isSelected
                  ? "border-[#FF6034] shadow-lg"
                  : "border-gray-200"
              } ${option.risk === "high" ? "opacity-60" : ""}`}>
                <CardContent className="p-4">
                  {/* 头部 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`mt-1 ${
                        isSelected ? "text-[#FF6034]" : "text-gray-600"
                      }`}>
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-bold ${
                            isSelected ? "text-[#FF6034]" : "text-gray-900"
                          }`}>
                            {option.name}
                          </h4>
                          {option.badge && (
                            <Badge className={`${
                              isRecommended
                                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                : "bg-yellow-500 text-white"
                            } text-xs`}>
                              {option.badge}
                            </Badge>
                          )}
                          {isRecommended && (
                            <Sparkles className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{option.shortDesc}</p>
                      </div>
                    </div>
                    <Badge className={`${getRiskColor(option.risk)} border text-xs`}>
                      {getRiskText(option.risk)}
                    </Badge>
                  </div>

                  {/* 展开详情 */}
                  {isSelected && (
                    <div className="mt-4 space-y-4 animate-in slide-in-from-top duration-300">
                      {/* 流程步骤 */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h5 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          办理流程
                        </h5>
                        <div className="space-y-2">
                          {option.steps.map((step, index) => (
                            <div key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 特点说明 */}
                      <div>
                        <h5 className="text-sm font-bold text-gray-700 mb-2">特点说明</h5>
                        <div className="space-y-1">
                          {option.features.map((feature, index) => (
                            <div
                              key={index}
                              className={`text-sm ${
                                feature.startsWith("✓")
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 费用说明 */}
                      {option.type === "collect_prepaid" && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h5 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            资金冻结说明
                          </h5>
                          <div className="space-y-2 text-sm text-blue-700">
                            <div className="flex justify-between">
                              <span>冻结金额：</span>
                              <span className="font-bold">¥{totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>冻结时间：</span>
                              <span>下单时</span>
                            </div>
                            <div className="flex justify-between">
                              <span>解冻时间：</span>
                              <span>收货确认后</span>
                            </div>
                            <div className="border-t border-blue-300 pt-2 mt-2">
                              <p className="text-xs">
                                💡 <strong>温馨提示：</strong>资金仅冻结不扣款，收货确认后自动支付给司机。
                                如收货人拒付，平台强制扣款保障您的权益。
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {option.type === "collect_deposit" && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <h5 className="text-sm font-bold text-yellow-900 mb-2">费用分配</h5>
                          <div className="space-y-2 text-sm text-yellow-700">
                            <div className="flex justify-between">
                              <span>定金（30%）：</span>
                              <span className="font-bold">¥{(totalAmount * 0.3).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>尾款（70%）：</span>
                              <span className="font-bold">¥{(totalAmount * 0.7).toFixed(2)}</span>
                            </div>
                            <div className="border-t border-yellow-300 pt-2 mt-2">
                              <p className="text-xs">
                                ⚠️ 定金支付后，如收货人拒收，定金不退。建议提前与收货人确认。
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {option.type === "collect_traditional" && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <h5 className="text-sm font-bold text-red-900 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            风险提示
                          </h5>
                          <div className="space-y-2 text-sm text-red-700">
                            <p>❌ <strong>高风险：</strong>收货人可能以各种理由拒付运费</p>
                            <p>❌ <strong>无保障：</strong>平台无法介入，纠纷自行处理</p>
                            <p>❌ <strong>司机抵触：</strong>司机可能不愿接单</p>
                            <div className="border-t border-red-300 pt-2 mt-2">
                              <p className="text-xs font-bold">
                                ⚠️ <strong>强烈建议：</strong>选择"平台担保付款"，完全无风险！
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      {/* 底部说明 */}
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-bold text-green-900 mb-2">货运宝平台保障</h4>
              <div className="space-y-1 text-sm text-green-700">
                <p>✓ 所有交易平台监管，资金安全有保障</p>
                <p>✓ 纠纷处理：7×24小时客服，快速响应</p>
                <p>✓ 先行赔付：货损货丢，平台先行赔付</p>
                <p>✓ 信用体系：恶意拒付将被拉黑</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}