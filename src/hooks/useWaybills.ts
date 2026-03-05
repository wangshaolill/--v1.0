import { useState, useCallback, useMemo } from "react";
import type { Waybill } from "@/types/waybill";
import { createWaybillFromOrder, createWaybillsFromOrders } from "@/utils/waybillUtils";
import type { Order } from "@/types/order";

/**
 * 运单管理Hook
 * 统一管理运单状态和业务逻辑
 */
export function useWaybills(initialWaybills: Waybill[]) {
  const [waybills, setWaybills] = useState<Waybill[]>(initialWaybills);

  // 添加运单
  const addWaybill = useCallback((waybill: Waybill) => {
    setWaybills((prev) => [waybill, ...prev]);
  }, []);

  // 批量添加运单
  const addWaybills = useCallback((newWaybills: Waybill[]) => {
    setWaybills((prev) => [...newWaybills, ...prev]);
  }, []);

  // 更新运单
  const updateWaybill = useCallback((waybillId: string, updates: Partial<Waybill>) => {
    setWaybills((prev) =>
      prev.map((w) => (w.id === waybillId ? { ...w, ...updates } : w))
    );
  }, []);

  // 删除运单
  const deleteWaybill = useCallback((waybillId: string) => {
    setWaybills((prev) => prev.filter((w) => w.id !== waybillId));
  }, []);

  // 从订单创建运单
  const createFromOrder = useCallback((order: Order) => {
    const waybill = createWaybillFromOrder(order);
    addWaybill(waybill);
    return waybill;
  }, [addWaybill]);

  // 批量更新运单（用于派单场景）
  const batchUpdateWaybills = useCallback((
    updates: Array<{ waybillId: string; data: Partial<Waybill> }>
  ) => {
    setWaybills((prev) =>
      prev.map((w) => {
        const update = updates.find((u) => u.waybillId === w.id);
        return update ? { ...w, ...update.data } : w;
      })
    );
  }, []);

  // 派单
  const assignDrivers = useCallback((
    assignments: Array<{
      waybillId: string;
      driverName: string;
      driverPhone: string;
      vehicleNumber: string;
    }>
  ) => {
    const updates = assignments.map((a) => ({
      waybillId: a.waybillId,
      data: {
        driverName: a.driverName,
        driverPhone: a.driverPhone,
        vehicleNumber: a.vehicleNumber,
      },
    }));
    batchUpdateWaybills(updates);
  }, [batchUpdateWaybills]);

  // 获取待处理运单数量（用于角标）
  const pendingWaybillsCount = useMemo(() => {
    return waybills.filter(
      (w) => w.status === "exception" || w.status === "loading" || w.status === "pickup_arrived"
    ).length;
  }, [waybills]);

  // 根据状态筛选运单
  const getWaybillsByStatus = useCallback((status?: string) => {
    return status ? waybills.filter((w) => w.status === status) : waybills;
  }, [waybills]);

  // 根据合同号获取运单
  const getWaybillsByContract = useCallback((contractNumber: string) => {
    return waybills.filter((w) => w.contractNumber === contractNumber);
  }, [waybills]);

  return {
    waybills,
    setWaybills,
    addWaybill,
    addWaybills,
    updateWaybill,
    deleteWaybill,
    createFromOrder,
    batchUpdateWaybills,
    assignDrivers,
    pendingWaybillsCount,
    getWaybillsByStatus,
    getWaybillsByContract,
  };
}