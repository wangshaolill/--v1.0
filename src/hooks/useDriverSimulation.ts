import { useEffect } from "react";
import { toast } from "sonner";
import type { Order } from "@/types/order";

interface UseDriverSimulationProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setContractOrder: (order: Order) => void;
}

/**
 * 🤖 模拟司机行为系统 Hook
 * 负责处理：
 * 1. 竞价订单：自动生成司机报价
 * 2. 一口价订单：模拟司机接单（根据价格合理性调整时间）
 * 3. 订单状态流转：阅读 → 确认 → 签约
 */
export function useDriverSimulation({
  orders,
  setOrders,
  setContractOrder,
}: UseDriverSimulationProps) {
  
  // 🚫 自动执行总开关 - 设置为 false 停止自动模拟司机行为
  const AUTO_SIMULATE_ENABLED = false; // ⚠️ 改为 true 恢复自动模拟
  
  // 🧪 测试模式开关
  const TEST_MODE = true;
  const TIME_SCALE = TEST_MODE ? 1000 : 60000; // 测试模式：秒，生产：分钟

  /**
   * 模拟司机竞价报价
   */
  const simulateDriverBidding = (orderId: string, duration: number) => {
    const mockBids = [
      {
        driverName: "张师傅",
        rating: 4.8,
        orderCount: 156,
        vehicleInfo: "9.6米厢式货车",
        vehicleNumber: "粤B12345",
        driverPhone: "13800138001",
      },
      {
        driverName: "王师傅",
        rating: 4.9,
        orderCount: 203,
        vehicleInfo: "9.6米厢式货车",
        vehicleNumber: "粤A88888",
        driverPhone: "13900139000",
      },
      {
        driverName: "李师傅",
        rating: 4.6,
        orderCount: 98,
        vehicleInfo: "9.6米厢式货车",
        vehicleNumber: "粤C66666",
        driverPhone: "13700137000",
      },
      {
        driverName: "赵师傅",
        rating: 4.7,
        orderCount: 132,
        vehicleInfo: "9.6米厢式货车",
        vehicleNumber: "粤D99999",
        driverPhone: "13600136000",
      },
    ];

    // 随机选择3-4个司机报价
    const biddersCount = 3 + Math.floor(Math.random() * 2);
    const selectedBidders = mockBids
      .sort(() => Math.random() - 0.5)
      .slice(0, biddersCount);

    // 获取订单信息用于价格计算
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // 基础价格（模拟市场价格）
    let basePrice = 1000;
    if (order.vehicleType) {
      if (order.vehicleType.includes("4.2")) basePrice = 800;
      else if (order.vehicleType.includes("6.8")) basePrice = 1200;
      else if (order.vehicleType.includes("9.6")) basePrice = 1800;
      else if (order.vehicleType.includes("13")) basePrice = 2500;
      else basePrice = 3500;
    }

    const minMarketPrice = Math.round(basePrice * 0.9);
    const maliciousThreshold = basePrice * 0.5;

    // 每个司机在不同时间报
    selectedBidders.forEach((bidder, index) => {
      const bidDelay = (5 + index * 3 + Math.random() * 2) * TIME_SCALE;

      setTimeout(() => {
        setOrders(prev => prev.map(o => {
          if (o.id === orderId && o.status === "published" && o.pricingMethod === "bidding") {
            // 计算报价
            const priceVariation = 1 + (Math.random() * 0.2 - 0.1);
            let bidPrice = Math.round(basePrice * priceVariation);
            
            // 过滤恶意报价
            if (bidPrice < maliciousThreshold) {
              bidPrice = minMarketPrice;
            }
            
            // 最低接受价过滤
            if (o.minAcceptablePrice && bidPrice < o.minAcceptablePrice) {
              return o;
            }

            const bidId = `BID${Date.now()}_${index}`;
            const newBid = {
              id: bidId,
              driverName: bidder.driverName,
              rating: bidder.rating,
              orderCount: bidder.orderCount,
              price: bidPrice,
              vehicleInfo: bidder.vehicleInfo,
              vehicleNumber: bidder.vehicleNumber,
              driverPhone: bidder.driverPhone,
              bidTime: new Date().toLocaleString(),
            };

            const existingBids = o.driverBids || [];
            const updatedBids = [...existingBids, newBid];

            // 第一个报时显示Toast
            if (existingBids.length === 0) {
              toast.success("收到司机报价", {
                description: `${bidder.driverName}报价¥${bidPrice.toLocaleString()}`,
              });
              
              return {
                ...o,
                status: "quoted",
                driverBids: updatedBids,
                quoterCount: updatedBids.length,
                biddingStatus: "active",
              };
            }

            return {
              ...o,
              driverBids: updatedBids,
              quoterCount: updatedBids.length,
            };
          }
          return o;
        }));
      }, bidDelay);
    });

    // 竞价截止提醒
    const deadlineTime = duration * TIME_SCALE;
    setTimeout(() => {
      setOrders(prev => prev.map(o => {
        if (o.id === orderId && o.status === "quoted" && !o.selectedBidId) {
          const bidsCount = o.driverBids?.length || 0;
          if (bidsCount > 0) {
            toast.info("竞价已截止", {
              description: `共收到${bidsCount}个报价，请选择承运司机`,
              action: {
                label: "查看报价",
                onClick: () => {},
              },
              duration: 10000,
            });
          } else {
            toast.warning("竞价流标", {
              description: "未收到司机报价，建议调整价格或线路",
            });
          }
          return { ...o, biddingCloseTime: new Date().toISOString() };
        }
        return o;
      }));
    }, deadlineTime);
  };

  /**
   * 模拟一口价订单司机接单
   */
  const simulateFixedPriceAcceptance = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.fixedPrice) return;
    
    const priceLevel = calculatePriceLevel(order);
    
    let acceptanceTime = 0;
    
    if (priceLevel === "low") {
      // 价格偏低：30分钟后流标
      acceptanceTime = 30 * TIME_SCALE;
      
      setTimeout(() => {
        setOrders(prev => prev.map(o => {
          if (o.id === orderId && o.status === "published") {
            toast.warning("订单未接单", {
              description: "价格偏低，建议加价后重新发布",
            });
            
            return {
              ...o,
              failedReason: "price_too_low",
              failedTime: new Date().toLocaleString(),
            };
          }
          return o;
        }));
      }, acceptanceTime);
      
    } else if (priceLevel === "high") {
      // 价格偏高：10分钟快速接单
      acceptanceTime = 10 * TIME_SCALE;
      
      setTimeout(() => {
        setOrders(prev => prev.map(o => {
          if (o.id === orderId && o.status === "published") {
            const updatedOrder = {
              ...o,
              status: "quoted" as const,
              driverName: "王师傅",
              vehicleNumber: "粤A88888",
              driverPhone: "13900139000",
              driverRating: 4.9,
              quotedPrice: o.fixedPrice,
              quotedTime: new Date().toLocaleString(),
            };
            setTimeout(() => setContractOrder(updatedOrder), 500);
            toast.success("司机已接单", { 
              description: "高价订单获得优质司机！" 
            });
            return updatedOrder;
          }
          return o;
        }));
      }, acceptanceTime);
      
    } else {
      // 价格合理：15-25分钟内接单
      acceptanceTime = (15 + Math.random() * 10) * TIME_SCALE;
      
      setTimeout(() => {
        setOrders(prev => prev.map(o => {
          if (o.id === orderId && o.status === "published") {
            const updatedOrder = {
              ...o,
              status: "quoted" as const,
              driverName: "李师傅",
              vehicleNumber: "粤B88888",
              driverPhone: "13800138000",
              driverRating: 4.7,
              quotedPrice: o.fixedPrice,
              quotedTime: new Date().toLocaleString(),
            };
            setTimeout(() => setContractOrder(updatedOrder), 500);
            toast.success("司机已接单", { 
              description: "请签署电子合同" 
            });
            return updatedOrder;
          }
          return o;
        }));
      }, acceptanceTime);
    }
  };

  /**
   * 计算价格合理性等级
   */
  const calculatePriceLevel = (order: Order): "low" | "normal" | "high" => {
    let basePrice = 1000;
    
    if (order.vehicleType) {
      if (order.vehicleType.includes("4.2")) basePrice = 800;
      else if (order.vehicleType.includes("6.8")) basePrice = 1200;
      else if (order.vehicleType.includes("9.6")) basePrice = 1800;
      else if (order.vehicleType.includes("13")) basePrice = 2500;
      else basePrice = 3500;
    }
    
    const marketPrice = basePrice * (1 + Math.random() * 0.3);
    const fixedPrice = order.fixedPrice || 0;
    
    if (fixedPrice < marketPrice * 0.85) return "low";
    if (fixedPrice > marketPrice * 1.2) return "high";
    return "normal";
  };

  // 🤖 主逻辑：监听订单状态变化
  useEffect(() => {
    // ⛔ 如果自动模拟被禁用，直接返回
    if (!AUTO_SIMULATE_ENABLED) {
      return;
    }
    
    orders.forEach(order => {
      // 1. 竞价订单 → 自动报价
      if (order.status === "published" && order.pricingMethod === "bidding") {
        console.log("🚚 检测到竞价订单，模拟司机报价...");
        simulateDriverBidding(order.id, order.biddingDuration || 30);
        
        setOrders(prev => prev.map(o => 
          o.id === order.id ? { ...o, status: "quoted" as const } : o
        ));
      }
      
      // 2. 一口价订单 → 自动接单
      if (order.status === "published" && order.pricingMethod === "fixed" && !order.fixedPriceTimeout) {
        console.log("💰 检测到一口价订单，启动接单倒计时...");
        simulateFixedPriceAcceptance(order.id);
        
        setOrders(prev => prev.map(o => 
          o.id === order.id ? { ...o, fixedPriceTimeout: true } : o
        ));
      }
      
      // 3. 货主选择报价 → 司机阅读确认
      if (order.status === "quoted" && order.selectedBidId && !order.readByDriver) {
        console.log("📖 司机自动阅读订单...");
        setTimeout(() => {
          setOrders(prev => prev.map(o => 
            o.id === order.id 
              ? { 
                  ...o, 
                  readByDriver: true,
                  status: "read" as const,
                  readTime: new Date().toLocaleString()
                } 
              : o
          ));
          
          // 阅读后1秒自动确认签约
          setTimeout(() => {
            setOrders(prev => prev.map(o => {
              if (o.id === order.id && o.status === "read") {
                const confirmedOrder = {
                  ...o,
                  status: "contracted" as const,
                  contractTime: new Date().toLocaleString(),
                };
                setTimeout(() => setContractOrder(confirmedOrder), 300);
                return confirmedOrder;
              }
              return o;
            }));
          }, 1000);
        }, 800);
      }
    });
  }, [orders]);

  return {
    simulateDriverBidding,
    simulateFixedPriceAcceptance,
  };
}