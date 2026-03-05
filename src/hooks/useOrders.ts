import { useState, useCallback, useMemo } from "react";
import type { Order } from "@/types/order";
import { getOrderBasePrice } from "@/utils/orderUtils";
import { toast } from "sonner";

/**
 * 订单管理Hook
 * 统一管理订单状态和业务逻辑
 */
export function useOrders(initialOrders: Order[]) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // 添加订单
  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  // 更新订单
  const updateOrder = useCallback((orderId: string, updates: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
    );
  }, []);

  // 删除订单
  const deleteOrder = useCallback((orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  }, []);

  // 选择竞价报价
  const selectBid = useCallback((orderId: string, bidId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const selectedBid = o.driverBids?.find((b) => b.id === bidId);
          if (selectedBid) {
            return {
              ...o,
              selectedBidId: bidId,
              driverName: selectedBid.driverName,
              vehicleNumber: selectedBid.vehicleNumber,
              driverPhone: selectedBid.driverPhone,
              quotedPrice: selectedBid.price,
              rating: selectedBid.rating,
            };
          }
        }
        return o;
      })
    );
  }, []);

  // 评价订单
  const rateOrder = useCallback((orderId: string, rating: number, review: string) => {
    updateOrder(orderId, { rating, review });
  }, [updateOrder]);

  // 订单加价
  const boostPrice = useCallback((orderId: string, newPrice: number) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      const oldPrice = getOrderBasePrice(order);
      updateOrder(orderId, {
        price: newPrice,
        fixedPrice: newPrice,
        status: "published",
      });
      
      toast.success("加价成功", {
        description: `运费已提升至¥${newPrice.toLocaleString()}，订单已重新推送`,
      });
    }
  }, [orders, updateOrder]);

  // 获取待处理订单数量（用于角标）
  const pendingOrdersCount = useMemo(() => {
    return orders.filter(
      (o) => o.status === "quoted" || o.status === "read" || o.status === "contracted"
    ).length;
  }, [orders]);

  // 根据状态筛选订单
  const getOrdersByStatus = useCallback((status?: string) => {
    return status ? orders.filter((o) => o.status === status) : orders;
  }, [orders]);

  return {
    orders,
    setOrders,
    addOrder,
    updateOrder,
    deleteOrder,
    selectBid,
    rateOrder,
    boostPrice,
    pendingOrdersCount,
    getOrdersByStatus,
  };
}