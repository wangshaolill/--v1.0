import { useEffect } from "react";
import { toast } from "sonner";
import type { Waybill } from "@/types/waybill";

interface UseWaybillLifecycleProps {
  waybills: Waybill[];
  setWaybills: React.Dispatch<React.SetStateAction<Waybill[]>>;
  setActiveTab?: (tab: string) => void;
}

/**
 * 🚛 运单生命周期自动化系统 Hook
 * 负责处理：
 * 1. 已签约 → 到达装货点（10分钟）
 * 2. 装货中 → 运输中（15分钟）
 * 3. 运输中 → 到达卸货点（30分钟，途中更新位置）
 * 4. 卸货中 → 签收完成（10分钟）
 */
export function useWaybillLifecycle({
  waybills,
  setWaybills,
  setActiveTab,
}: UseWaybillLifecycleProps) {
  
  // 🚫 自动执行总开关 - 设置为 false 停止自动执行运单流程
  const AUTO_EXECUTE_ENABLED = false; // ⚠️ 改为 true 恢复自动执行
  
  // 🧪 测试模式开关
  const TEST_MODE = true;
  const TIME_SCALE = TEST_MODE ? 1000 : 60000; // 测试模式：秒，生产：分钟

  useEffect(() => {
    // ⛔ 如果自动执行被禁用，直接返回
    if (!AUTO_EXECUTE_ENABLED) {
      return;
    }
    
    waybills.forEach(waybill => {
      // 1. 已签约 (contracted) → 10分钟后到达装货点
      if (waybill.status === "contracted" && !waybill.lifecycleStarted) {
        console.log("🚚 运单已生成，启动生命周期...", waybill.waybillNumber);
        
        setWaybills(prev => prev.map(w => 
          w.id === waybill.id ? { ...w, lifecycleStarted: true } : w
        ));
        
        setTimeout(() => {
          setWaybills(prev => prev.map(w => {
            if (w.id === waybill.id && w.status === "contracted") {
              toast.info("司机已到达装货点", { 
                description: `运单${w.waybillNumber}` 
              });
              
              const newTracking = {
                id: `${w.id}-pickup-arrived`,
                type: "pickup" as const,
                time: new Date().toLocaleString(),
                location: w.from || "装货地点",
                description: "司机已到达装货点，准备装货",
                operator: w.driverName || "司机",
              };
              
              return {
                ...w,
                status: "pickup_arrived" as const,
                tracking: [...(w.tracking || []), newTracking],
              };
            }
            return w;
          }));
        }, 10 * TIME_SCALE);
      }
      
      // 2. 已到达装货点 (pickup_arrived) → 15分钟后装货完成
      if (waybill.status === "pickup_arrived" && !waybill.loadingStarted) {
        console.log("📦 开始装货...", waybill.waybillNumber);
        
        setWaybills(prev => prev.map(w => 
          w.id === waybill.id ? { ...w, loadingStarted: true } : w
        ));
        
        setTimeout(() => {
          setWaybills(prev => prev.map(w => {
            if (w.id === waybill.id && w.status === "pickup_arrived") {
              toast.success("装货完成", { 
                description: `运单${w.waybillNumber}已出发` 
              });
              
              const newTracking = {
                id: `${w.id}-in-transit`,
                type: "transit" as const,
                time: new Date().toLocaleString(),
                location: w.from || "装货地点",
                description: "装货完成，车辆已出发",
                operator: w.driverName || "司机",
              };
              
              return {
                ...w,
                status: "in_transit" as const,
                tracking: [...(w.tracking || []), newTracking],
                actualPickupTime: new Date().toLocaleString(),
              };
            }
            return w;
          }));
        }, 15 * TIME_SCALE);
      }
      
      // 3. 运输中 (in_transit) → 途中更新位置，30分钟后到达
      if (waybill.status === "in_transit" && !waybill.transitStarted) {
        console.log("🚛 运输中...", waybill.waybillNumber);
        
        setWaybills(prev => prev.map(w => 
          w.id === waybill.id ? { ...w, transitStarted: true } : w
        ));
        
        // 模拟途中轨迹更新
        const locations = [
          "已驶离装货地30公里",
          "已行驶60公里，预计1小时后到达",
          "已行驶90公里，即将到达目的地",
        ];
        
        locations.forEach((location, index) => {
          setTimeout(() => {
            setWaybills(prev => prev.map(w => {
              if (w.id === waybill.id && w.status === "in_transit") {
                const newTracking = {
                  id: `${w.id}-transit-${index}`,
                  type: "transit" as const,
                  time: new Date().toLocaleString(),
                  location: location,
                  description: `运输中 - ${location}`,
                  operator: w.driverName || "司机",
                };
                
                return {
                  ...w,
                  tracking: [...(w.tracking || []), newTracking],
                };
              }
              return w;
            }));
          }, (index + 1) * 5 * TIME_SCALE);
        });
        
        // 30分钟后到达卸货点
        setTimeout(() => {
          setWaybills(prev => prev.map(w => {
            if (w.id === waybill.id && w.status === "in_transit") {
              toast.info("司机已到达卸货��", { 
                description: `运单${w.waybillNumber}` 
              });
              
              const newTracking = {
                id: `${w.id}-delivery-arrived`,
                type: "arrival" as const,
                time: new Date().toLocaleString(),
                location: w.to || "卸货地点",
                description: "司机已到达卸货点，准备卸货",
                operator: w.driverName || "司机",
              };
              
              return {
                ...w,
                status: "delivery_arrived" as const,
                tracking: [...(w.tracking || []), newTracking],
              };
            }
            return w;
          }));
        }, 30 * TIME_SCALE);
      }
      
      // 4. 已到达卸货点 (delivery_arrived) → 10分钟后签收完成
      if (waybill.status === "delivery_arrived" && !waybill.unloadingStarted) {
        console.log("📦 开始卸货...", waybill.waybillNumber);
        
        setWaybills(prev => prev.map(w => 
          w.id === waybill.id ? { ...w, unloadingStarted: true } : w
        ));
        
        setTimeout(() => {
          setWaybills(prev => prev.map(w => {
            if (w.id === waybill.id && w.status === "delivery_arrived") {
              toast.success("货物已签收", { 
                description: `运单${w.waybillNumber}已完成`,
                action: {
                  label: "去评价",
                  onClick: () => {
                    if (setActiveTab) setActiveTab("waybills");
                  }
                }
              });
              
              const newTracking = {
                id: `${w.id}-signed`,
                type: "signed" as const,
                time: new Date().toLocaleString(),
                location: w.to || "卸货地点",
                description: "货物已签收，运输完成",
                operator: w.receiverName || "收货人",
                signature: "已签名",
              };
              
              return {
                ...w,
                status: "signed" as const,
                tracking: [...(w.tracking || []), newTracking],
                actualDeliveryTime: new Date().toLocaleString(),
                signedTime: new Date().toLocaleString(),
              };
            }
            return w;
          }));
        }, 10 * TIME_SCALE);
      }
    });
  }, [waybills, setWaybills, setActiveTab]);
}