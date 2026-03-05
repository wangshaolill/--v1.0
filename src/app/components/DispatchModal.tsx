import { useState } from "react";
import { X, User, Truck, CheckCircle2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import type { Order } from "@/types/order";
import type { Waybill } from "@/types/waybill";

interface DispatchModalProps {
  orderIds: string[];
  orders: Order[];
  onClose: () => void;
  onConfirm: (orderIds: string[], waybillsData: Waybill[]) => void;
}

// 模拟可用司机列表
const AVAILABLE_DRIVERS = [
  { id: "D1", name: "李师傅", phone: "13800138001", vehicleNumber: "粤B12345", vehicleType: "9.6米厢式货车" },
  { id: "D2", name: "王师傅", phone: "13800138002", vehicleNumber: "粤B23456", vehicleType: "9.6米厢式货车" },
  { id: "D3", name: "张师傅", phone: "13800138003", vehicleNumber: "粤B34567", vehicleType: "7.6米厢式货车" },
  { id: "D4", name: "刘师傅", phone: "13800138004", vehicleNumber: "粤B45678", vehicleType: "13米高栏车" },
  { id: "D5", name: "陈师傅", phone: "13800138005", vehicleNumber: "粤B56789", vehicleType: "17.5米平板车" },
];

export function DispatchModal({ orderIds, orders, onClose, onConfirm }: DispatchModalProps) {
  const [selectedDrivers, setSelectedDrivers] = useState<Map<string, string>>(new Map());

  const handleDriverChange = (orderId: string, driverId: string) => {
    const newMap = new Map(selectedDrivers);
    newMap.set(orderId, driverId);
    setSelectedDrivers(newMap);
  };

  const handleConfirm = () => {
    // 检查是否所有订单都已分配司机
    const allAssigned = orders.every((order) => selectedDrivers.has(order.id));
    if (!allAssigned) {
      alert("请为所有订单分配司机");
      return;
    }

    // 生成运单数据
    const waybillsData: Waybill[] = orders.map((order) => {
      const driverId = selectedDrivers.get(order.id)!;
      const driver = AVAILABLE_DRIVERS.find((d) => d.id === driverId)!;

      return {
        id: `WB${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        orderId: order.id,
        contractNumber: order.contractNumber || `CT${Date.now()}`,
        status: "待装货" as const,
        from: order.from,
        to: order.to,
        cargoType: order.cargoType,
        weight: order.weight,
        vehicleType: order.vehicleType,
        totalPrice: order.totalPrice,
        driverName: driver.name,
        driverPhone: driver.phone,
        vehicleNumber: driver.vehicleNumber,
        pickupAddress: order.pickupAddress,
        pickupContact: order.pickupContact,
        pickupPhone: order.pickupPhone,
        deliveryAddress: order.deliveryAddress,
        deliveryContact: order.deliveryContact,
        deliveryPhone: order.deliveryPhone,
        estimatedDepartureTime: order.pickupTime,
        estimatedArrivalTime: order.estimatedArrivalTime,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    onConfirm(orderIds, waybillsData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">派单</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {orders.map((order) => {
            const selectedDriverId = selectedDrivers.get(order.id);
            const selectedDriver = selectedDriverId
              ? AVAILABLE_DRIVERS.find((d) => d.id === selectedDriverId)
              : null;

            return (
              <Card key={order.id} className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {order.from} → {order.to}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {order.cargoType} · {order.weight}吨 · {order.vehicleType}
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-[#FF6034]">
                    ¥{order.totalPrice?.toLocaleString() || 0}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>选择司机</Label>
                  <Select
                    value={selectedDriverId || ""}
                    onValueChange={(value) => handleDriverChange(order.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择司机" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_DRIVERS.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{driver.name}</span>
                            <span className="text-gray-500 text-sm">
                              {driver.vehicleNumber}
                            </span>
                            <span className="text-gray-400 text-xs">
                              {driver.vehicleType}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedDriver && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-green-900">
                            已选择司机
                          </div>
                          <div className="text-sm text-green-700 mt-1">
                            <div className="flex items-center gap-2">
                              <User className="w-3.5 h-3.5" />
                              {selectedDriver.name} - {selectedDriver.phone}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Truck className="w-3.5 h-3.5" />
                              {selectedDriver.vehicleNumber} ({selectedDriver.vehicleType})
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-[#FF6034] hover:bg-[#FF4444]"
          >
            确认派单
          </Button>
        </div>
      </Card>
    </div>
  );
}
