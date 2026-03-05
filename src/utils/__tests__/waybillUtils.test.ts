import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createWaybillFromOrder, createWaybillsFromOrders } from '../waybillUtils';
import type { Order } from '@/types/order';

describe('waybillUtils', () => {
  let mockOrder: Order;

  beforeEach(() => {
    // Mock Date.now() 为固定值以便测试
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-05T10:00:00.000Z'));

    mockOrder = {
      id: 'ORDER001',
      orderNumber: 'ORD123456',
      contractNumber: 'CONTRACT001',
      cargoType: '电子产品',
      weight: 5,
      fromCity: '深圳',
      toCity: '广州',
      pickupAddress: '深圳市南山区科技园',
      deliveryAddress: '广州市天河区珠江新城',
      vehicleType: '4.2米厢式货车',
      pickupTime: '2026-02-06 09:00',
      paymentMethod: 'prepaid' as const,
      fixedPrice: 800,
      pricingMethod: 'fixed' as const,
      createTime: '2026-02-05 10:00',
      status: 'quoted' as const,
      driverName: '李师傅',
      driverPhone: '13800138000',
      vehicleNumber: '粤B88888',
      isSplit: false,
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createWaybillFromOrder', () => {
    it('should create waybill from order', () => {
      const waybill = createWaybillFromOrder(mockOrder);

      expect(waybill.id).toBe('WB1738753200000');
      expect(waybill.orderId).toBe('ORDER001');
      expect(waybill.orderNumber).toBe('ORD123456');
      expect(waybill.contractNumber).toBe('CONTRACT001');
      expect(waybill.cargoType).toBe('电子产品');
      expect(waybill.weight).toBe(5);
      expect(waybill.fromCity).toBe('深圳');
      expect(waybill.toCity).toBe('广州');
      expect(waybill.vehicleType).toBe('4.2米厢式货车');
      expect(waybill.status).toBe('pickup_arrived');
      expect(waybill.paymentMethod).toBe('prepaid');
      expect(waybill.amount).toBe(800);
    });

    it('should extract district and street from addresses', () => {
      const waybill = createWaybillFromOrder(mockOrder);

      expect(waybill.fromDistrict).toBe('南山区');
      expect(waybill.fromStreet).toBe('科技园');
      expect(waybill.toDistrict).toBe('天河区');
      expect(waybill.toStreet).toBe('珠江新城');
    });

    it('should calculate estimated arrival time (2 days after departure)', () => {
      const waybill = createWaybillFromOrder(mockOrder);

      // 2026-02-06 09:00 + 2天 = 2026-02-08 09:00
      expect(waybill.estimatedArrival).toContain('2026');
      expect(waybill.estimatedArrival).toContain('02');
      expect(waybill.estimatedArrival).toContain('08');
    });

    it('should set current location based on pickup address', () => {
      const waybill = createWaybillFromOrder(mockOrder);

      expect(waybill.currentLocation).toBe('深圳南山区');
    });

    it('should handle split order with index', () => {
      const splitOrder: Order = {
        ...mockOrder,
        isSplit: true,
        parentId: 'PARENT001',
        splitIndex: 0,
        splitTotal: 3,
      };

      const waybill = createWaybillFromOrder(splitOrder, 0);

      expect(waybill.id).toBe('WB1738753200000_0');
      expect(waybill.waybillNumber).toContain('-1');
      expect(waybill.isSplit).toBe(true);
      expect(waybill.parentId).toBe('PARENT_WB1738753200000');
      expect(waybill.splitIndex).toBe(0);
      expect(waybill.splitTotal).toBe(3);
    });

    it('should use quotedPrice if fixedPrice is not available', () => {
      const orderWithQuotedPrice: Order = {
        ...mockOrder,
        fixedPrice: undefined,
        quotedPrice: 900,
      };

      const waybill = createWaybillFromOrder(orderWithQuotedPrice);

      expect(waybill.amount).toBe(900);
    });

    it('should handle missing driver information', () => {
      const orderWithoutDriver: Order = {
        ...mockOrder,
        driverName: undefined,
        driverPhone: undefined,
        vehicleNumber: undefined,
      };

      const waybill = createWaybillFromOrder(orderWithoutDriver);

      expect(waybill.driverName).toBe('');
      expect(waybill.driverPhone).toBe('');
      expect(waybill.vehicleNumber).toBe('');
    });

    it('should initialize progress to 0', () => {
      const waybill = createWaybillFromOrder(mockOrder);

      expect(waybill.progress).toBe(0);
    });

    it('should set status to pickup_arrived', () => {
      const waybill = createWaybillFromOrder(mockOrder);

      expect(waybill.status).toBe('pickup_arrived');
    });
  });

  describe('createWaybillsFromOrders', () => {
    it('should create multiple waybills from orders array', () => {
      const orders: Order[] = [
        { ...mockOrder, id: 'ORDER001' },
        { ...mockOrder, id: 'ORDER002' },
        { ...mockOrder, id: 'ORDER003' },
      ];

      const waybills = createWaybillsFromOrders(orders);

      expect(waybills).toHaveLength(3);
      expect(waybills[0].orderId).toBe('ORDER001');
      expect(waybills[1].orderId).toBe('ORDER002');
      expect(waybills[2].orderId).toBe('ORDER003');
    });

    it('should create waybills with proper indices', () => {
      const orders: Order[] = [
        { ...mockOrder, id: 'ORDER001' },
        { ...mockOrder, id: 'ORDER002' },
      ];

      const waybills = createWaybillsFromOrders(orders);

      expect(waybills[0].id).toContain('_0');
      expect(waybills[1].id).toContain('_1');
      expect(waybills[0].waybillNumber).toContain('-1');
      expect(waybills[1].waybillNumber).toContain('-2');
    });

    it('should handle empty orders array', () => {
      const waybills = createWaybillsFromOrders([]);

      expect(waybills).toHaveLength(0);
    });

    it('should handle split orders correctly', () => {
      const splitOrders: Order[] = [
        {
          ...mockOrder,
          id: 'ORDER001',
          isSplit: true,
          parentId: 'PARENT001',
          splitIndex: 0,
          splitTotal: 2,
        },
        {
          ...mockOrder,
          id: 'ORDER002',
          isSplit: true,
          parentId: 'PARENT001',
          splitIndex: 1,
          splitTotal: 2,
        },
      ];

      const waybills = createWaybillsFromOrders(splitOrders);

      expect(waybills).toHaveLength(2);
      expect(waybills[0].isSplit).toBe(true);
      expect(waybills[1].isSplit).toBe(true);
      expect(waybills[0].splitIndex).toBe(0);
      expect(waybills[1].splitIndex).toBe(1);
    });
  });
});
