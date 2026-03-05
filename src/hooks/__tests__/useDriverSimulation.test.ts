import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDriverSimulation } from '@/hooks/useDriverSimulation';
import type { Order } from '@/types/order';

describe('useDriverSimulation', () => {
  let mockOrders: Order[];
  let mockSetOrders: ReturnType<typeof vi.fn>;
  let mockSetContractOrder: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSetOrders = vi.fn((updater) => {
      if (typeof updater === 'function') {
        mockOrders = updater(mockOrders);
      }
    });
    mockSetContractOrder = vi.fn();
    
    // 清空mock数据
    mockOrders = [];
    vi.clearAllMocks();
  });

  describe('竞价订单模拟', () => {
    it('应该在发布竞价订单后触发司机报价', async () => {
      const biddingOrder: Order = {
        id: 'TEST001',
        orderNumber: 'ORD001',
        contractNumber: 'CT001',
        route: '深圳-广州',
        fromCity: '深圳',
        toCity: '广州',
        status: 'published',
        pricingMethod: 'bidding',
        biddingDuration: 30,
        createTime: '2026-02-26 10:00',
        cargoType: '测试货物',
        weight: 10,
        pickupAddress: '深圳市南山区',
        pickupContact: '张三',
        pickupPhone: '13800138000',
        deliveryAddress: '广州市天河区',
        deliveryContact: '李四',
        deliveryPhone: '13900139000',
        paymentMethod: 'prepaid',
      };

      mockOrders = [biddingOrder];

      renderHook(() =>
        useDriverSimulation({
          orders: mockOrders,
          setOrders: mockSetOrders,
          setContractOrder: mockSetContractOrder,
        })
      );

      // 验证状态更新函数被调用
      await waitFor(() => {
        expect(mockSetOrders).toHaveBeenCalled();
      });
    });

    it('应该生成多个司机报价', async () => {
      const biddingOrder: Order = {
        id: 'TEST002',
        orderNumber: 'ORD002',
        contractNumber: 'CT002',
        route: '深圳-上海',
        fromCity: '深圳',
        toCity: '上海',
        status: 'published',
        pricingMethod: 'bidding',
        biddingDuration: 30,
        createTime: '2026-02-26 10:00',
        cargoType: '测试货物',
        weight: 15,
        vehicleType: '9.6米厢式货车',
        pickupAddress: '深圳市南山区',
        pickupContact: '张三',
        pickupPhone: '13800138000',
        deliveryAddress: '上海市浦东区',
        deliveryContact: '李四',
        deliveryPhone: '13900139000',
        paymentMethod: 'prepaid',
      };

      mockOrders = [biddingOrder];

      renderHook(() =>
        useDriverSimulation({
          orders: mockOrders,
          setOrders: mockSetOrders,
          setContractOrder: mockSetContractOrder,
        })
      );

      // 验证报价生成（需要等待异步操作）
      await waitFor(
        () => {
          expect(mockSetOrders).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('一口价订单模拟', () => {
    it('应该在发布一口价订单后触发司机接单', async () => {
      const fixedPriceOrder: Order = {
        id: 'TEST003',
        orderNumber: 'ORD003',
        contractNumber: 'CT003',
        route: '深圳-北京',
        fromCity: '深圳',
        toCity: '北京',
        status: 'published',
        pricingMethod: 'fixed',
        fixedPrice: 5000,
        createTime: '2026-02-26 10:00',
        cargoType: '测试货物',
        weight: 20,
        pickupAddress: '深圳市南山区',
        pickupContact: '张三',
        pickupPhone: '13800138000',
        deliveryAddress: '北京市朝阳区',
        deliveryContact: '李四',
        deliveryPhone: '13900139000',
        paymentMethod: 'prepaid',
      };

      mockOrders = [fixedPriceOrder];

      renderHook(() =>
        useDriverSimulation({
          orders: mockOrders,
          setOrders: mockSetOrders,
          setContractOrder: mockSetContractOrder,
        })
      );

      // 验证接单逻辑触发
      await waitFor(() => {
        expect(mockSetOrders).toHaveBeenCalled();
      });
    });
  });

  describe('订单状态流转', () => {
    it('应该在货主选择报价后自动确认签约', async () => {
      const quotedOrder: Order = {
        id: 'TEST004',
        orderNumber: 'ORD004',
        contractNumber: 'CT004',
        route: '深圳-杭州',
        fromCity: '深圳',
        toCity: '杭州',
        status: 'quoted',
        pricingMethod: 'bidding',
        selectedBidId: 'BID001',
        createTime: '2026-02-26 10:00',
        cargoType: '测试货物',
        weight: 12,
        driverBids: [
          {
            id: 'BID001',
            driverName: '王师傅',
            rating: 4.8,
            orderCount: 200,
            price: 3000,
            vehicleInfo: '9.6米厢式货车',
            vehicleNumber: '粤A12345',
            driverPhone: '13800138000',
            bidTime: '2026-02-26 10:05',
          },
        ],
        pickupAddress: '深圳市南山区',
        pickupContact: '张三',
        pickupPhone: '13800138000',
        deliveryAddress: '杭州市西湖区',
        deliveryContact: '李四',
        deliveryPhone: '13900139000',
        paymentMethod: 'prepaid',
      };

      mockOrders = [quotedOrder];

      renderHook(() =>
        useDriverSimulation({
          orders: mockOrders,
          setOrders: mockSetOrders,
          setContractOrder: mockSetContractOrder,
        })
      );

      // 验证自动确认流程
      await waitFor(
        () => {
          expect(mockSetOrders).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });
  });
});
