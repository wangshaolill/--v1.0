import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VehicleTypeSelector } from '../VehicleTypeSelector';

describe('VehicleTypeSelector', () => {
  it('应该渲染车辆数量选择器', () => {
    const onChange = vi.fn();
    render(
      <VehicleTypeSelector
        vehicles={[{ vehicleLength: '9.6米', vehicleStyle: '厢式' }]}
        onChange={onChange}
      />
    );

    expect(screen.getByText(/车辆配置/)).toBeInTheDocument();
  });

  it('应该允许增加车辆数量', () => {
    const onChange = vi.fn();
    render(
      <VehicleTypeSelector
        vehicles={[{ vehicleLength: '9.6米', vehicleStyle: '厢式' }]}
        onChange={onChange}
      />
    );

    // 查找增加按钮并点击
    const addButton = screen.getByText('+');
    fireEvent.click(addButton);

    expect(onChange).toHaveBeenCalled();
    const newVehicles = onChange.mock.calls[0][0];
    expect(newVehicles).toHaveLength(2);
  });

  it('应该允许减少车辆数量', () => {
    const onChange = vi.fn();
    render(
      <VehicleTypeSelector
        vehicles={[
          { vehicleLength: '9.6米', vehicleStyle: '厢式' },
          { vehicleLength: '9.6米', vehicleStyle: '厢式' },
        ]}
        onChange={onChange}
      />
    );

    const removeButton = screen.getByText('-');
    fireEvent.click(removeButton);

    expect(onChange).toHaveBeenCalled();
    const newVehicles = onChange.mock.calls[0][0];
    expect(newVehicles).toHaveLength(1);
  });

  it('应该限制最小车辆数量为1', () => {
    const onChange = vi.fn();
    render(
      <VehicleTypeSelector
        vehicles={[{ vehicleLength: '9.6米', vehicleStyle: '厢式' }]}
        onChange={onChange}
      />
    );

    const removeButton = screen.getByText('-');
    fireEvent.click(removeButton);

    // 应该不允许减少到0辆
    expect(onChange).not.toHaveBeenCalled();
  });

  it('应该限制最大车辆数量为10', () => {
    const onChange = vi.fn();
    const maxVehicles = Array(10).fill({ vehicleLength: '9.6米', vehicleStyle: '厢式' });
    
    render(
      <VehicleTypeSelector
        vehicles={maxVehicles}
        onChange={onChange}
      />
    );

    const addButton = screen.getByText('+');
    fireEvent.click(addButton);

    // 应该不允许超过10辆
    expect(onChange).not.toHaveBeenCalled();
  });

  it('应该允许修改单个车辆的配置', () => {
    const onChange = vi.fn();
    render(
      <VehicleTypeSelector
        vehicles={[
          { vehicleLength: '9.6米', vehicleStyle: '厢式' },
          { vehicleLength: '9.6米', vehicleStyle: '厢式' },
        ]}
        onChange={onChange}
      />
    );

    // 这里应该测试更改车长或车型的交互
    // 具体实现取决于VehicleTypeSelector的UI结构
  });
});
