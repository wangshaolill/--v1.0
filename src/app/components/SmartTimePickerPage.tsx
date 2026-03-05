import { useState, useEffect } from "react";
import { X, ChevronRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { toast } from "sonner";

interface SmartTimePickerPageProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  initialTime?: string;
  initialTimeRange?: string;
  initialNegotiable?: boolean;
  onSave: (data: {
    date: string;
    time: string;
    timeRange?: string;
    negotiable: boolean;
  }) => void;
}

// 时间段配置
const TIME_SLOTS = [
  { key: "morning", label: "上午", start: "08:00", end: "12:00", icon: "🌅" },
  { key: "afternoon", label: "下午", start: "13:00", end: "18:00", icon: "☀️" },
  { key: "evening", label: "晚上", start: "19:00", end: "22:00", icon: "🌙" },
];

export function SmartTimePickerPage({
  isOpen,
  onClose,
  initialDate = "",
  initialTime = "",
  initialTimeRange = "",
  initialNegotiable = false,
  onSave,
}: SmartTimePickerPageProps) {
  // 日期选择
  const [selectedDateType, setSelectedDateType] = useState<"today" | "tomorrow" | "dayAfter" | "custom">("tomorrow");
  const [customDate, setCustomDate] = useState("");
  
  // 时间段选择
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("morning");
  
  // 时间可协商
  const [negotiable, setNegotiable] = useState(initialNegotiable);

  // 生成快捷日期
  const getQuickDates = () => {
    const now = new Date();
    return [
      {
        type: "today" as const,
        label: "今天",
        date: now,
        display: `${now.getMonth() + 1}月${now.getDate()}日`,
        weekday: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][now.getDay()],
      },
      {
        type: "tomorrow" as const,
        label: "明天",
        date: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        display: `${new Date(now.getTime() + 24 * 60 * 60 * 1000).getMonth() + 1}月${new Date(now.getTime() + 24 * 60 * 60 * 1000).getDate()}日`,
        weekday: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][new Date(now.getTime() + 24 * 60 * 60 * 1000).getDay()],
      },
      {
        type: "dayAfter" as const,
        label: "后天",
        date: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        display: `${new Date(now.getTime() + 48 * 60 * 60 * 1000).getMonth() + 1}月${new Date(now.getTime() + 48 * 60 * 60 * 1000).getDate()}日`,
        weekday: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][new Date(now.getTime() + 48 * 60 * 60 * 1000).getDay()],
      },
    ];
  };

  const quickDates = getQuickDates();

  // 获取当前选择的日期
  const getSelectedDate = (): Date => {
    if (selectedDateType === "custom" && customDate) {
      return new Date(customDate);
    }
    const quickDate = quickDates.find(d => d.type === selectedDateType);
    return quickDate ? quickDate.date : new Date();
  };

  // 格式化日期为 YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 获取选中时间段的时间字符串
  const getTimeSlotTime = (slotKey: string): string => {
    const slot = TIME_SLOTS.find(s => s.key === slotKey);
    return slot ? slot.start : "09:00";
  };

  // 获取选中时间段的范围字符串
  const getTimeSlotRange = (slotKey: string): string => {
    const slot = TIME_SLOTS.find(s => s.key === slotKey);
    return slot ? `${slot.start}-${slot.end}` : "";
  };

  // 生成显示摘要
  const getDisplaySummary = (): string => {
    const date = getSelectedDate();
    const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
    const weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "六"][date.getDay()];
    const slot = TIME_SLOTS.find(s => s.key === selectedTimeSlot);
    const timeStr = slot ? `${slot.label} ${slot.start}-${slot.end}` : "";
    
    return `${dateStr} ${weekday} ${timeStr}`;
  };

  // 确认保存
  const handleConfirm = () => {
    const date = getSelectedDate();
    const dateStr = formatDate(date);
    const time = getTimeSlotTime(selectedTimeSlot);
    const timeRange = getTimeSlotRange(selectedTimeSlot);
    
    onSave({
      date: dateStr,
      time,
      timeRange,
      negotiable,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/50 z-[70] backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 主内容 */}
      <div className="fixed inset-x-0 top-0 bottom-0 z-[70] flex flex-col bg-white">
        {/* 顶部导航栏 */}
        <div className="shrink-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
          <h1 className="text-base font-bold text-gray-900">选择取货时间</h1>
          <div className="w-8" />
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {/* 日期选择 */}
          <div className="bg-white px-4 py-3 mb-2">
            <div className="text-xs text-gray-500 mb-2">选择日期</div>
            <div className="grid grid-cols-3 gap-2">
              {quickDates.map((item) => (
                <button
                  key={item.type}
                  onClick={() => {
                    setSelectedDateType(item.type);
                    setCustomDate("");
                  }}
                  className={`py-2.5 px-2 rounded-lg border-2 transition-all ${
                    selectedDateType === item.type
                      ? "border-[#FF6034] bg-orange-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className={`text-xs font-medium mb-0.5 ${
                    selectedDateType === item.type ? "text-[#FF6034]" : "text-gray-900"
                  }`}>
                    {item.label}
                  </div>
                  <div className={`text-[10px] ${
                    selectedDateType === item.type ? "text-orange-600" : "text-gray-500"
                  }`}>
                    {item.display}
                  </div>
                  <div className={`text-[10px] ${
                    selectedDateType === item.type ? "text-orange-500" : "text-gray-400"
                  }`}>
                    {item.weekday}
                  </div>
                </button>
              ))}
            </div>

            {/* 自定义日期 */}
            <button
              onClick={() => setSelectedDateType("custom")}
              className={`w-full mt-2 py-2 px-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                selectedDateType === "custom"
                  ? "border-[#FF6034] bg-orange-50"
                  : "border-gray-200"
              }`}
            >
              <span className={`text-xs font-medium ${
                selectedDateType === "custom" ? "text-[#FF6034]" : "text-gray-700"
              }`}>
                📅 自定义日期
              </span>
              {selectedDateType === "custom" && customDate && (
                <span className="text-xs text-orange-600">
                  {new Date(customDate).getMonth() + 1}月{new Date(customDate).getDate()}日
                </span>
              )}
              {selectedDateType === "custom" && !customDate && (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {selectedDateType === "custom" && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full mt-2 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FF6034]"
                min={new Date().toISOString().split("T")[0]}
                max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
              />
            )}
          </div>

          {/* 时间段选择 */}
          <div className="bg-white px-4 py-3 mb-2">
            <div className="text-xs text-gray-500 mb-2">选择时间段</div>
            <div className="space-y-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot.key}
                  onClick={() => setSelectedTimeSlot(slot.key)}
                  className={`w-full py-3 px-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                    selectedTimeSlot === slot.key
                      ? "border-[#FF6034] bg-orange-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{slot.icon}</span>
                    <div className="text-left">
                      <div className={`text-sm font-medium ${
                        selectedTimeSlot === slot.key ? "text-[#FF6034]" : "text-gray-900"
                      }`}>
                        {slot.label}
                      </div>
                      <div className={`text-xs ${
                        selectedTimeSlot === slot.key ? "text-orange-600" : "text-gray-500"
                      }`}>
                        {slot.start} - {slot.end}
                      </div>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedTimeSlot === slot.key
                      ? "border-[#FF6034]"
                      : "border-gray-300"
                  }`}>
                    {selectedTimeSlot === slot.key && (
                      <div className="w-3 h-3 rounded-full bg-[#FF6034]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 时间选项 */}
          <div className="bg-white px-4 py-3">
            <div className="text-xs text-gray-500 mb-2">时间选项</div>
            <div className="space-y-2">
              {/* 时间可协商 */}
              <button
                onClick={() => setNegotiable(true)}
                className={`w-full py-2.5 px-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                  negotiable
                    ? "border-green-400 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    negotiable ? "border-green-500 bg-green-500" : "border-gray-300"
                  }`}>
                    {negotiable && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    negotiable ? "text-green-700" : "text-gray-700"
                  }`}>
                    时间可协商
                  </span>
                </div>
                <span className="text-xs text-gray-500">司机可联系调整</span>
              </button>

              {/* 严格按时 */}
              <button
                onClick={() => setNegotiable(false)}
                className={`w-full py-2.5 px-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                  !negotiable
                    ? "border-orange-400 bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    !negotiable ? "border-[#FF6034] bg-[#FF6034]" : "border-gray-300"
                  }`}>
                    {!negotiable && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    !negotiable ? "text-[#FF6034]" : "text-gray-700"
                  }`}>
                    严格按时
                  </span>
                </div>
                <span className="text-xs text-gray-500">超时订单自动取消</span>
              </button>
            </div>
          </div>

          {/* 温馨提示 */}
          <div className="px-4 py-3">
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              <p className="text-xs text-orange-700 leading-relaxed">
                💡 建议预留充足装卸时间，避开午休高峰期（12:00-13:00）
              </p>
            </div>
          </div>
        </div>

        {/* 底部确认区域 */}
        <div className="shrink-0 bg-white border-t px-4 py-3">
          {/* 已选择预览 */}
          <div className="mb-3 py-2 px-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">已选择</span>
              {negotiable && (
                <Badge className="bg-green-100 text-green-700 border-0 text-[10px] h-4 px-1.5">
                  可协商
                </Badge>
              )}
            </div>
            <div className="text-sm font-bold text-gray-900 mt-1">
              {getDisplaySummary()}
            </div>
          </div>

          {/* 确认按钮 */}
          <Button
            onClick={handleConfirm}
            className="w-full h-11 bg-[#FF6034] hover:bg-[#FF6034]/90 text-white font-bold text-base"
          >
            确认
          </Button>
        </div>
      </div>
    </>
  );
}