import { describe, it, expect } from 'vitest';
import {
  getSimplifiedStatus,
  getStatusLabel,
  getStatusColor,
  getStatusBgColor,
  getStatusDescription,
  isOrderOperatable,
  isOrderCompleted,
  isOrderCancelled,
  isOrderAlert,
  getOrderStatsByStatus,
  filterOrdersByStatus,
  sortOrdersByStatus,
} from '../statusUtils';
import type { Order } from '@/types/order';

describe('statusUtils', () => {
  const createMockOrder = (status: string, createTime = '2026-02-05 10:00:00'): Order => ({
    id: `ORDER_${status}`,
    orderNumber: `ORD${Math.random()}`,
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
    createTime,
    status: status as any,
    isSplit: false,
  });

  describe('getSimplifiedStatus', () => {
    it('should return pending status for draft', () => {
      const status = getSimplifiedStatus('draft');
      expect(status.label).toBe('待处理');
    });

    it('should return active status for quoted', () => {
      const status = getSimplifiedStatus('quoted');
      expect(status.label).toBe('进行中');
    });

    it('should return completed status for deal', () => {
      const status = getSimplifiedStatus('deal');
      expect(status.label).toBe('已完成');
    });

    it('should return cancelled status for cancelled', () => {
      const status = getSimplifiedStatus('cancelled');
      expect(status.label).toBe('已取消');
    });

    it('should return alert status for exception', () => {
      const status = getSimplifiedStatus('exception');
      expect(status.label).toBe('需关注');
    });

    it('should return pending for unknown status', () => {
      const status = getSimplifiedStatus('unknown_status');
      expect(status.label).toBe('待处理');
    });
  });

  describe('getStatusLabel', () => {
    it('should return label without count', () => {
      const label = getStatusLabel('draft');
      expect(label).toBe('待处理');
    });

    it('should return label with count', () => {
      const label = getStatusLabel('draft', 5);
      expect(label).toBe('5·待处理');
    });

    it('should handle zero count', () => {
      const label = getStatusLabel('quoted', 0);
      expect(label).toBe('0·进行中');
    });
  });

  describe('getStatusColor', () => {
    it('should return orange for pending status', () => {
      expect(getStatusColor('draft')).toContain('orange');
    });

    it('should return blue for active status', () => {
      expect(getStatusColor('quoted')).toContain('blue');
    });

    it('should return green for completed status', () => {
      expect(getStatusColor('deal')).toContain('green');
    });

    it('should return gray for cancelled status', () => {
      expect(getStatusColor('cancelled')).toContain('gray');
    });

    it('should return red for alert status', () => {
      expect(getStatusColor('exception')).toContain('red');
    });
  });

  describe('getStatusBgColor', () => {
    it('should return background color for status', () => {
      expect(getStatusBgColor('draft')).toContain('orange');
      expect(getStatusBgColor('quoted')).toContain('blue');
      expect(getStatusBgColor('deal')).toContain('green');
    });
  });

  describe('getStatusDescription', () => {
    it('should return description for status', () => {
      const desc = getStatusDescription('draft');
      expect(desc).toBeTruthy();
      expect(typeof desc).toBe('string');
    });
  });

  describe('isOrderOperatable', () => {
    it('should return true for pending status', () => {
      expect(isOrderOperatable('draft')).toBe(true);
      expect(isOrderOperatable('published')).toBe(true);
    });

    it('should return true for active status', () => {
      expect(isOrderOperatable('quoted')).toBe(true);
      expect(isOrderOperatable('read')).toBe(true);
    });

    it('should return false for completed status', () => {
      expect(isOrderOperatable('deal')).toBe(false);
    });

    it('should return false for cancelled status', () => {
      expect(isOrderOperatable('cancelled')).toBe(false);
    });
  });

  describe('isOrderCompleted', () => {
    it('should return true for completed status', () => {
      expect(isOrderCompleted('deal')).toBe(true);
    });

    it('should return false for non-completed status', () => {
      expect(isOrderCompleted('draft')).toBe(false);
      expect(isOrderCompleted('quoted')).toBe(false);
      expect(isOrderCompleted('cancelled')).toBe(false);
    });
  });

  describe('isOrderCancelled', () => {
    it('should return true for cancelled status', () => {
      expect(isOrderCancelled('cancelled')).toBe(true);
    });

    it('should return false for non-cancelled status', () => {
      expect(isOrderCancelled('draft')).toBe(false);
      expect(isOrderCancelled('quoted')).toBe(false);
      expect(isOrderCancelled('deal')).toBe(false);
    });
  });

  describe('isOrderAlert', () => {
    it('should return true for alert status', () => {
      expect(isOrderAlert('exception')).toBe(true);
    });

    it('should return false for non-alert status', () => {
      expect(isOrderAlert('draft')).toBe(false);
      expect(isOrderAlert('quoted')).toBe(false);
      expect(isOrderAlert('deal')).toBe(false);
    });
  });

  describe('getOrderStatsByStatus', () => {
    it('should count orders by status', () => {
      const orders: Order[] = [
        createMockOrder('draft'),
        createMockOrder('draft'),
        createMockOrder('quoted'),
        createMockOrder('deal'),
        createMockOrder('cancelled'),
        createMockOrder('exception'),
      ];

      const stats = getOrderStatsByStatus(orders);

      expect(stats.pending).toBe(2); // 2 draft orders
      expect(stats.active).toBe(1);  // 1 quoted order
      expect(stats.completed).toBe(1); // 1 deal order
      expect(stats.cancelled).toBe(1); // 1 cancelled order
      expect(stats.alert).toBe(1); // 1 exception order
    });

    it('should handle empty orders array', () => {
      const stats = getOrderStatsByStatus([]);

      expect(stats.pending).toBe(0);
      expect(stats.active).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.cancelled).toBe(0);
      expect(stats.alert).toBe(0);
    });

    it('should handle unknown status as pending', () => {
      const orders: Order[] = [
        createMockOrder('unknown_status' as any),
      ];

      const stats = getOrderStatsByStatus(orders);

      expect(stats.pending).toBe(1);
    });
  });

  describe('filterOrdersByStatus', () => {
    const orders: Order[] = [
      createMockOrder('draft'),
      createMockOrder('quoted'),
      createMockOrder('deal'),
      createMockOrder('cancelled'),
    ];

    it('should filter pending orders', () => {
      const filtered = filterOrdersByStatus(orders, 'pending');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe('draft');
    });

    it('should filter active orders', () => {
      const filtered = filterOrdersByStatus(orders, 'active');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe('quoted');
    });

    it('should filter completed orders', () => {
      const filtered = filterOrdersByStatus(orders, 'completed');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe('deal');
    });

    it('should filter cancelled orders', () => {
      const filtered = filterOrdersByStatus(orders, 'cancelled');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe('cancelled');
    });

    it('should return empty array if no matches', () => {
      const filtered = filterOrdersByStatus(orders, 'alert');
      expect(filtered).toHaveLength(0);
    });
  });

  describe('sortOrdersByStatus', () => {
    it('should sort orders by priority', () => {
      const orders: Order[] = [
        createMockOrder('deal', '2026-02-05 10:00:00'),
        createMockOrder('exception', '2026-02-05 11:00:00'),
        createMockOrder('quoted', '2026-02-05 12:00:00'),
        createMockOrder('draft', '2026-02-05 13:00:00'),
        createMockOrder('cancelled', '2026-02-05 14:00:00'),
      ];

      const sorted = sortOrdersByStatus(orders);

      // 优先级: alert(1) > active(2) > pending(3) > completed(4) > cancelled(5)
      expect(sorted[0].status).toBe('exception'); // alert
      expect(sorted[1].status).toBe('quoted');    // active
      expect(sorted[2].status).toBe('draft');     // pending
      expect(sorted[3].status).toBe('deal');      // completed
      expect(sorted[4].status).toBe('cancelled'); // cancelled
    });

    it('should sort by createTime within same priority', () => {
      const orders: Order[] = [
        createMockOrder('draft', '2026-02-05 10:00:00'),
        createMockOrder('draft', '2026-02-05 12:00:00'),
        createMockOrder('draft', '2026-02-05 11:00:00'),
      ];

      const sorted = sortOrdersByStatus(orders);

      // 同优先级按创建时间倒序（最新的在前）
      expect(sorted[0].createTime).toBe('2026-02-05 12:00:00');
      expect(sorted[1].createTime).toBe('2026-02-05 11:00:00');
      expect(sorted[2].createTime).toBe('2026-02-05 10:00:00');
    });

    it('should not mutate original array', () => {
      const orders: Order[] = [
        createMockOrder('deal'),
        createMockOrder('draft'),
      ];

      const originalOrder = [...orders];
      sortOrdersByStatus(orders);

      expect(orders).toEqual(originalOrder);
    });

    it('should handle empty array', () => {
      const sorted = sortOrdersByStatus([]);
      expect(sorted).toHaveLength(0);
    });
  });
});
