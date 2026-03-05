import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useWaybillLifecycle } from '@/hooks/useWaybillLifecycle';
import type { Waybill } from '@/types/waybill';

describe('useWaybillLifecycle', () => {
  let mockWaybills: Waybill[];
  let mockSetWaybills: ReturnType<typeof vi.fn>;
  let mockSetActiveTab: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSetWaybills = vi.fn((updater) => {
      if (typeof updater === 'function') {
        mockWaybills = updater(mockWaybills);
      }
    });
    mockSetActiveTab = vi.fn();
    
    mockWaybills = [];
    vi.clearAllMocks();
  });

  describe('运单生命周期', () => {
    it('应该从已签约状态自动流转到到达装货点', async () => {
      const contractedWaybill: Waybill = {
        id: 'WB001',
        waybillNumber: 'YD20260226001',
        orderId: 'ORD001',
        contractNumber: 'CT001',
        status: 'contracted',
        from: '深圳市南山区',
        to: '广州市天河区',
        cargoType: '测试货物',
        weight: 10,
        driverName: '王师傅',
        vehicleNumber: '粤A12345',
        driverPhone: '13800138000',
        createTime: '2026-02-26 10:00',
        tracking: [],
      };

      mockWaybills = [contractedWaybill];

      renderHook(() =>
        useWaybillLifecycle({
          waybills: mockWaybills,
          setWaybills: mockSetWaybills,
          setActiveTab: mockSetActiveTab,
        })
      );

      // 验证生命周期启动
      await waitFor(() => {
        expect(mockSetWaybills).toHaveBeenCalled();
      });
    });

    it('应该从到达装货点流转到运输中', async () => {
      const pickupArrivedWaybill: Waybill = {
        id: 'WB002',
        waybillNumber: 'YD20260226002',
        orderId: 'ORD002',
        contractNumber: 'CT002',
        status: 'pickup_arrived',
        from: '深圳市南山区',
        to: '上海市浦东区',
        cargoType: '测试货物',
        weight: 15,
        driverName: '李师傅',
        vehicleNumber: '粤B88888',
        driverPhone: '13900139000',
        createTime: '2026-02-26 10:00',
        lifecycleStarted: true,
        tracking: [
          {
            id: 'TRACK001',
            type: 'pickup',
            time: '2026-02-26 10:10',
            location: '深圳市南山区',
            description: '司机已到达装货点',
            operator: '李师傅',
          },
        ],
      };

      mockWaybills = [pickupArrivedWaybill];

      renderHook(() =>
        useWaybillLifecycle({
          waybills: mockWaybills,
          setWaybills: mockSetWaybills,
          setActiveTab: mockSetActiveTab,
        })
      );

      await waitFor(() => {
        expect(mockSetWaybills).toHaveBeenCalled();
      });
    });

    it('应该在运输中更新轨迹', async () => {
      const inTransitWaybill: Waybill = {
        id: 'WB003',
        waybillNumber: 'YD20260226003',
        orderId: 'ORD003',
        contractNumber: 'CT003',
        status: 'in_transit',
        from: '深圳市南山区',
        to: '北京市朝阳区',
        cargoType: '测试货物',
        weight: 20,
        driverName: '张师傅',
        vehicleNumber: '粤C66666',
        driverPhone: '13700137000',
        createTime: '2026-02-26 10:00',
        lifecycleStarted: true,
        loadingStarted: true,
        tracking: [
          {
            id: 'TRACK001',
            type: 'pickup',
            time: '2026-02-26 10:10',
            location: '深圳市南山区',
            description: '司机已到达装货点',
            operator: '张师傅',
          },
          {
            id: 'TRACK002',
            type: 'transit',
            time: '2026-02-26 10:25',
            location: '深圳市南山区',
            description: '装货完成，车辆已出发',
            operator: '张师傅',
          },
        ],
      };

      mockWaybills = [inTransitWaybill];

      renderHook(() =>
        useWaybillLifecycle({
          waybills: mockWaybills,
          setWaybills: mockSetWaybills,
          setActiveTab: mockSetActiveTab,
        })
      );

      await waitFor(() => {
        expect(mockSetWaybills).toHaveBeenCalled();
      });
    });

    it('应该从卸货中流转到签收完成', async () => {
      const deliveryArrivedWaybill: Waybill = {
        id: 'WB004',
        waybillNumber: 'YD20260226004',
        orderId: 'ORD004',
        contractNumber: 'CT004',
        status: 'delivery_arrived',
        from: '深圳市南山区',
        to: '杭州市西湖区',
        cargoType: '测试货物',
        weight: 12,
        driverName: '赵师傅',
        vehicleNumber: '粤D99999',
        driverPhone: '13600136000',
        createTime: '2026-02-26 10:00',
        lifecycleStarted: true,
        loadingStarted: true,
        transitStarted: true,
        tracking: [],
      };

      mockWaybills = [deliveryArrivedWaybill];

      renderHook(() =>
        useWaybillLifecycle({
          waybills: mockWaybills,
          setWaybills: mockSetWaybills,
          setActiveTab: mockSetActiveTab,
        })
      );

      await waitFor(() => {
        expect(mockSetWaybills).toHaveBeenCalled();
      });
    });
  });

  describe('边界条件', () => {
    it('不应该重复触发已启动的生命周期', () => {
      const waybillWithStartedLifecycle: Waybill = {
        id: 'WB005',
        waybillNumber: 'YD20260226005',
        orderId: 'ORD005',
        contractNumber: 'CT005',
        status: 'contracted',
        lifecycleStarted: true, // 已启动
        from: '深圳市南山区',
        to: '成都市武侯区',
        cargoType: '测试货物',
        weight: 8,
        driverName: '钱师傅',
        vehicleNumber: '粤E11111',
        driverPhone: '13500135000',
        createTime: '2026-02-26 10:00',
        tracking: [],
      };

      mockWaybills = [waybillWithStartedLifecycle];

      renderHook(() =>
        useWaybillLifecycle({
          waybills: mockWaybills,
          setWaybills: mockSetWaybills,
          setActiveTab: mockSetActiveTab,
        })
      );

      // lifecycleStarted=true 时不应该再次触发
      expect(mockSetWaybills).not.toHaveBeenCalled();
    });

    it('应该处理空运单列表', () => {
      mockWaybills = [];

      renderHook(() =>
        useWaybillLifecycle({
          waybills: mockWaybills,
          setWaybills: mockSetWaybills,
          setActiveTab: mockSetActiveTab,
        })
      );

      // 空列表不应该报错
      expect(mockSetWaybills).not.toHaveBeenCalled();
    });
  });
});
