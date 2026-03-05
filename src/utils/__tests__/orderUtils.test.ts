import { describe, it, expect } from 'vitest';
import { getOrderBasePrice } from '../orderUtils';
import type { Order } from '@/types/order';

describe('orderUtils', () => {
  const createMockOrder = (overrides?: Partial<Order>): Order => ({
    id: 'ORDER001',
    orderNumber: 'ORD123456',
    contractNumber: 'CONTRACT001',
    cargoType: '电子产品',
    weight: 5,
    fromCity: '深圳',
    toCity: '广州',
    pickupAddress: '深圳市南山区',
    deliveryAddress: '广州市天河区',
    vehicleType: '4.2米厢式货车',
    pickupTime: '2026-02-06 09:00',
    paymentMethod: 'prepaid' as const,
    pricingMethod: 'fixed' as const,
    createTime: '2026-02-05 10:00',
    status: 'draft',
    isSplit: false,
    ...overrides,
  });

  describe('getOrderBasePrice', () => {
    it('should return fixedPrice when available', () => {
      const order = createMockOrder({ fixedPrice: 800 });
      expect(getOrderBasePrice(order)).toBe(800);
    });

    it('should return quotedPrice when fixedPrice is not available', () => {
      const order = createMockOrder({ quotedPrice: 900 });
      expect(getOrderBasePrice(order)).toBe(900);
    });

    it('should prefer fixedPrice over quotedPrice', () => {
      const order = createMockOrder({ 
        fixedPrice: 800, 
        quotedPrice: 900 
      });
      expect(getOrderBasePrice(order)).toBe(800);
    });

    it('should return 0 when neither fixedPrice nor quotedPrice is available', () => {
      const order = createMockOrder();
      expect(getOrderBasePrice(order)).toBe(0);
    });

    it('should handle 0 as valid fixedPrice', () => {
      const order = createMockOrder({ fixedPrice: 0 });
      expect(getOrderBasePrice(order)).toBe(0);
    });

    it('should handle 0 as valid quotedPrice', () => {
      const order = createMockOrder({ quotedPrice: 0 });
      expect(getOrderBasePrice(order)).toBe(0);
    });
  });
});
