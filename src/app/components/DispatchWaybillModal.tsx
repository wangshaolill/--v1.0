import { useState } from "react";
import { X, Users, User, Truck, Package, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { toast } from "sonner";
import type { Waybill } from "@/types/waybill";

interface DispatchWaybillModalProps {
  isOpen: boolean;
  waybills: Waybill[];  // 同一合同号下的所有运单
  contractNumber: string;
  onClose: () => void;
  onConfirm: (assignments: Array<{ waybillId: string; driverName: string; driverPhone: string; vehicleNumber: string }>) => void;
}

// 模拟可用司机列表
const AVAILABLE_DRIVERS = [
  { id: "D1", name: "李师傅", phone: "13800138001", vehicleNumber: "粤B12345", vehicleType: "9.6米厢式货车", rating: 4.9, orderCount: 328 },
  { id: "D2", name: "王师傅", phone: "13800138002", vehicleNumber: "粤B23456", vehicleType: "9.6米厢式货车", rating: 4.8, orderCount: 256 },
  { id: "D3", name: "张师傅", phone: "13800138003", vehicleNumber: "粤B34567", vehicleType: "7.6米厢式货车", rating: 4.7, orderCount: 189 },
  { id: "D4", name: "刘师傅", phone: "13800138004", vehicleNumber: "粤B45678", vehicleType: "13米高栏车", rating: 4.6, orderCount: 145 },
  { id: "D5", name: "陈师傅", phone: "13800138005", vehicleNumber: "粤B56789", vehicleType: "17.5米平板车", rating: 4.8, orderCount: 201 },
];

export function DispatchWaybillModal({ isOpen, waybills, contractNumber, onClose, onConfirm }: DispatchWaybillModalProps) {
  const [dispatchMode, setDispatchMode] = useState<"single" | "multiple">("single");
  const [singleDriver, setSingleDriver] = useState<string>("");
  const [multipleDrivers, setMultipleDrivers] = useState<Map<string, string>>(new Map());

  if (!isOpen) return null;

  // 处理单司机模式选择
  const handleSingleDriverChange = (driverId: string) => {
    setSingleDriver(driverId);
  };

  // 处理多司机模式选择
  const handleMultipleDriverChange = (waybillId: string, driverId: string) => {
    setMultipleDrivers(new Map(multipleDrivers).set(waybillId, driverId));
  };

  // 确认派单
  const handleConfirm = () => {
    const assignments: Array<{ waybillId: string; driverName: string; driverPhone: string; vehicleNumber: string }> = [];

    if (dispatchMode === "single") {
      // 单司机模式：所有运单派给同一个司机
      if (!singleDriver) {
        toast.error("请选择司机");
        return;
      }

      const driver = AVAILABLE_DRIVERS.find(d => d.id === singleDriver);
      if (!driver) return;

      waybills.forEach(waybill => {
        assignments.push({
          waybillId: waybill.id,
          driverName: driver.name,
          driverPhone: driver.phone,
          vehicleNumber: driver.vehicleNumber,
        });
      });
    } else {
      // 多司机模式：每个运单有不同的司机
      const allAssigned = waybills.every(waybill => multipleDrivers.has(waybill.id));
      if (!allAssigned) {
        toast.error("请为所有运单分配司机");
        return;
      }

      waybills.forEach(waybill => {
        const driverId = multipleDrivers.get(waybill.id);
        const driver = AVAILABLE_DRIVERS.find(d => d.id === driverId);
        if (driver) {
          assignments.push({
            waybillId: waybill.id,
            driverName: driver.name,
            driverPhone: driver.phone,
            vehicleNumber: driver.vehicleNumber,
          });
        }
      });
    }

    onConfirm(assignments);
    onClose();
  };

  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl animate-in slide-in-from-right duration-300 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* 头部 */}
          <div className="shrink-0 bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-black text-white">灵活派单</h2>
                <p className="text-xs text-blue-100 mt-1">合同号: {contractNumber}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-white hover:bg-white/20 rounded-full"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* 滚动内容 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 派单模式选择 */}
            <Card className="border-2 border-blue-200">
              <CardContent className="p-4">
                <Label className="text-sm font-bold text-gray-900 mb-3 block">派单模式</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className={`h-auto py-3 flex flex-col items-center gap-2 transition-all ${
                      dispatchMode === "single"
                        ? "bg-blue-50 border-blue-500 border-2 shadow-md"
                        : "border-gray-300"
                    }`}
                    onClick={() => setDispatchMode("single")}
                  >
                    <User className={`w-6 h-6 ${dispatchMode === "single" ? "text-blue-500" : "text-gray-400"}`} />
                    <div className="text-center">
                      <p className={`text-sm font-bold ${dispatchMode === "single" ? "text-blue-600" : "text-gray-600"}`}>
                        单司机派单
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">集中运输</p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className={`h-auto py-3 flex flex-col items-center gap-2 transition-all ${
                      dispatchMode === "multiple"
                        ? "bg-purple-50 border-purple-500 border-2 shadow-md"
                        : "border-gray-300"
                    }`}
                    onClick={() => setDispatchMode("multiple")}
                  >
                    <Users className={`w-6 h-6 ${dispatchMode === "multiple" ? "text-purple-500" : "text-gray-400"}`} />
                    <div className="text-center">
                      <p className={`text-sm font-bold ${dispatchMode === "multiple" ? "text-purple-600" : "text-gray-600"}`}>
                        多司机派单
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">分批运输</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 运单列表概览 */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-bold text-gray-900">运单列表</Label>
                  <Badge variant="outline" className="text-[10px]">
                    共{waybills.length}个运单
                  </Badge>
                </div>
                <div className="space-y-2">
                  {waybills.map((waybill, index) => (
                    <div key={waybill.id} className="flex items-center gap-2 text-xs p-2 bg-gray-50 rounded">
                      <Badge variant="outline" className="text-[10px] shrink-0">#{index + 1}</Badge>
                      <Package className="w-3 h-3 text-blue-600 shrink-0" />
                      <span className="flex-1 text-gray-700">{waybill.cargoType} · {waybill.weight}吨</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 单司机模式 */}
            {dispatchMode === "single" && (
              <Card className="border-blue-200">
                <CardContent className="p-4">
                  <Label className="text-sm font-bold text-gray-900 mb-3 block">选择司机</Label>
                  <Select value={singleDriver} onValueChange={handleSingleDriverChange}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="请选择承运司机" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_DRIVERS.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="font-medium">{driver.name} · {driver.vehicleNumber}</p>
                              <p className="text-xs text-gray-500">
                                {driver.vehicleType} · ⭐{driver.rating} · {driver.orderCount}单
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {singleDriver && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-blue-900">已选择司机</p>
                          <p className="text-xs text-blue-700 mt-1">
                            所有{waybills.length}个运单将派给{" "}
                            {AVAILABLE_DRIVERS.find(d => d.id === singleDriver)?.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 多司机模式 */}
            {dispatchMode === "multiple" && (
              <Card className="border-purple-200">
                <CardContent className="p-4">
                  <Label className="text-sm font-bold text-gray-900 mb-3 block">
                    ��每个运单分配司机
                  </Label>
                  <div className="space-y-3">
                    {waybills.map((waybill, index) => (
                      <div key={waybill.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-[10px]">#{index + 1}</Badge>
                          <span className="text-xs font-medium text-gray-700">
                            {waybill.cargoType} · {waybill.weight}吨
                          </span>
                        </div>
                        <Select
                          value={multipleDrivers.get(waybill.id) || ""}
                          onValueChange={(value) => handleMultipleDriverChange(waybill.id, value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="选择司机" />
                          </SelectTrigger>
                          <SelectContent>
                            {AVAILABLE_DRIVERS.map((driver) => (
                              <SelectItem key={driver.id} value={driver.id}>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs">
                                    {driver.name} · {driver.vehicleNumber}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>

                  {waybills.every(w => multipleDrivers.has(w.id)) && (
                    <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-purple-900">派单方案已完成</p>
                          <p className="text-xs text-purple-700 mt-1">
                            {waybills.length}个运单将由{new Set(Array.from(multipleDrivers.values())).size}位司机分别承运
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 提示信息 */}
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-amber-900 font-medium">温馨提示</p>
                    <ul className="text-xs text-amber-700 mt-1 space-y-1 list-disc list-inside">
                      <li>同一合同号下的所有运单遵循相同合同条款</li>
                      <li>单司机模式适合同城或同路线集中运输</li>
                      <li>多司机模式适合不同时间或不同路线分批运输</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 底部按钮 */}
          <div className="shrink-0 p-4 bg-white border-t shadow-lg space-y-2">
            <Button
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold shadow-lg"
              onClick={handleConfirm}
              disabled={
                dispatchMode === "single"
                  ? !singleDriver
                  : !waybills.every(w => multipleDrivers.has(w.id))
              }
            >
              {dispatchMode === "single"
                ? `确认派单给${singleDriver ? AVAILABLE_DRIVERS.find(d => d.id === singleDriver)?.name : "选中的司机"}`
                : `确认派单（${waybills.filter(w => multipleDrivers.has(w.id)).length}/${waybills.length}）`}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={onClose}
            >
              取消
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}