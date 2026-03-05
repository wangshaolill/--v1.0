import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UnifiedOrderCard } from '../UnifiedOrderCard';
import type { Order } from '@/types/order';

describe('UnifiedOrderCard', () => {
  const mockOrder: Order = {
    id: 'test-order-1',
    pickup: '广州市天河区',
    delivery: '深圳市南山区',
    distance: 120,
    vehicleLength: '9.6米',
    vehicleStyle: '厢式',
    cargoName: '电子产品',
    cargoWeight: 5000,
    price: 2800,
    fixedPrice: 2800,
    pricingMethod: 'fixed',
    paymentMethod: 'prepaid',
    status: 'published',
    urgent: false,
    createdTime: '2026-02-12 10:00',
    vehicles: [{
      vehicleLength: '9.6米',
      vehicleStyle: '厢式',
    }],
  };

  it('应该正确渲染订单基本信息', () => {
    render(<UnifiedOrderCard order={mockOrder} />);

    expect(screen.getByText('广州市天河区')).toBeInTheDocument();
    expect(screen.getByText('深圳市南山区')).toBeInTheDocument();
    expect(screen.getByText('120km')).toBeInTheDocument();
    expect(screen.getByText('电子产品')).toBeInTheDocument();
  });

  it('应该显示正确的价格格式', () => {
    render(<UnifiedOrderCard order={mockOrder} />);

    expect(screen.getByText(/2,800/)).toBeInTheDocument();
  });

  it('应该在加急订单上显示加急标识', () => {
    const urgentOrder = { ...mockOrder, urgent: true };
    render(<UnifiedOrderCard order={urgentOrder} />);

    expect(screen.getByText('加急')).toBeInTheDocument();
  });

  it('应该正确显示多车订单标识', () => {
    const multiVehicleOrder: Order = {
      ...mockOrder,
      isMainOrder: true,
      totalVehicleCount: 3,
    };

    render(<UnifiedOrderCard order={multiVehicleOrder} />);
    expect(screen.getByText(/主订单/)).toBeInTheDocument();
  });

  it('应该正确显示子订单车辆序号', () => {
    const childOrder: Order = {
      ...mockOrder,
      isMainOrder: false,
      vehicleIndex: 2,
      totalVehicleCount: 3,
    };

    render(<UnifiedOrderCard order={childOrder} />);
    expect(screen.getByText(/2\/3号车/)).toBeInTheDocument();
  });

  it('应该在点击时调用onExpand回调', () => {
    const onExpand = vi.fn();
    render(<UnifiedOrderCard order={mockOrder} onExpand={onExpand} />);

    const card = screen.getByText('广州市天河区').closest('div');
    if (card) {
      fireEvent.click(card);
      expect(onExpand).toHaveBeenCalledWith(mockOrder.id);
    }
  });

  it('应该正确显示竞价订单的报价数量', () => {
    const biddingOrder: Order = {
      ...mockOrder,
      pricingMethod: 'bidding',
      quoterCount: 5,
      driverBids: [],
    };

    render(<UnifiedOrderCard order={biddingOrder} />);
    expect(screen.getByText(/5/)).toBeInTheDocument();
  });
});
