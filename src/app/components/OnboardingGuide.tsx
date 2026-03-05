import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { X, MapPin, Truck, FileCheck, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";

interface OnboardingGuideProps {
  onComplete: () => void;
}

const ONBOARDING_STEPS = [
  {
    id: 1,
    icon: MapPin,
    color: "bg-gradient-to-br from-green-500 to-emerald-500",
    title: "智能定位找车",
    description: "自动定位您的位置，优先显示回程配货车辆，最高省40%运费",
    image: "🚛",
  },
  {
    id: 2,
    icon: Truck,
    color: "bg-gradient-to-br from-blue-500 to-cyan-500",
    title: "极速下单",
    description: "智能预填充上次订单信息，3步完成下单，支持一口价和竞价两种模式",
    image: "⚡",
  },
  {
    id: 3,
    icon: FileCheck,
    color: "bg-gradient-to-br from-orange-500 to-red-500",
    title: "电子合同保障",
    description: "订单成交自动生成电子合同，全程透明，运单实时追踪",
    image: "📋",
  },
];

export function OnboardingGuide({ onComplete }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = ONBOARDING_STEPS[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* 关闭按钮 */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 text-white/60 hover:text-white hover:bg-white/10 rounded-full"
        onClick={handleSkip}
      >
        <X className="w-6 h-6" />
      </Button>

      {/* 内容区 */}
      <div className="h-full flex flex-col items-center justify-between px-6 py-12">
        {/* 顶部logo */}
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-8 h-8" />
          <h1 className="text-2xl font-black">货运宝</h1>
        </div>

        {/* 中间内容 */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
          <Card className={`${step.color} border-0 shadow-2xl w-full mb-8 overflow-hidden`}>
            <CardContent className="p-8 text-white text-center">
              {/* 图标 */}
              <div className="w-24 h-24 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-6xl">{step.image}</span>
              </div>

              {/* 标题 */}
              <h2 className="text-2xl font-black mb-4 drop-shadow-md">{step.title}</h2>

              {/* 描述 */}
              <p className="text-base text-white/90 leading-relaxed">
                {step.description}
              </p>
            </CardContent>
          </Card>

          {/* 进度指示器 */}
          <div className="flex items-center gap-2 mb-8">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "w-8 bg-white"
                    : index < currentStep
                    ? "w-2 bg-white/60"
                    : "w-2 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="w-full max-w-sm space-y-3">
          <Button
            size="lg"
            className="w-full h-14 bg-white hover:bg-gray-100 text-gray-900 font-bold text-lg shadow-xl rounded-2xl"
            onClick={handleNext}
          >
            {currentStep < ONBOARDING_STEPS.length - 1 ? "下一步" : "立即体验"}
          </Button>

          {currentStep < ONBOARDING_STEPS.length - 1 && (
            <Button
              variant="ghost"
              size="lg"
              className="w-full h-12 text-white/60 hover:text-white hover:bg-white/10 font-medium rounded-2xl"
              onClick={handleSkip}
            >
              跳过
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}