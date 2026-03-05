import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDialog, useDialogWithData } from '../useDialog';

describe('useDialog', () => {
  it('should initialize with default closed state', () => {
    const { result } = renderHook(() => useDialog());
    expect(result.current.isOpen).toBe(false);
  });

  it('should initialize with custom initial state', () => {
    const { result } = renderHook(() => useDialog(true));
    expect(result.current.isOpen).toBe(true);
  });

  it('should open dialog', () => {
    const { result } = renderHook(() => useDialog());
    
    act(() => {
      result.current.open();
    });
    
    expect(result.current.isOpen).toBe(true);
  });

  it('should close dialog', () => {
    const { result } = renderHook(() => useDialog(true));
    
    act(() => {
      result.current.close();
    });
    
    expect(result.current.isOpen).toBe(false);
  });

  it('should toggle dialog state', () => {
    const { result } = renderHook(() => useDialog());
    
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);
    
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('should set dialog state directly', () => {
    const { result } = renderHook(() => useDialog());
    
    act(() => {
      result.current.setIsOpen(true);
    });
    expect(result.current.isOpen).toBe(true);
    
    act(() => {
      result.current.setIsOpen(false);
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('should maintain stable function references', () => {
    const { result, rerender } = renderHook(() => useDialog());
    
    const firstOpen = result.current.open;
    const firstClose = result.current.close;
    const firstToggle = result.current.toggle;
    
    rerender();
    
    expect(result.current.open).toBe(firstOpen);
    expect(result.current.close).toBe(firstClose);
    expect(result.current.toggle).toBe(firstToggle);
  });
});

describe('useDialogWithData', () => {
  interface TestData {
    id: string;
    name: string;
  }

  it('should initialize with null data', () => {
    const { result } = renderHook(() => useDialogWithData<TestData>());
    expect(result.current.data).toBeNull();
    expect(result.current.isOpen).toBe(false);
  });

  it('should initialize with custom initial data', () => {
    const initialData: TestData = { id: '1', name: 'Test' };
    const { result } = renderHook(() => useDialogWithData<TestData>(initialData));
    expect(result.current.data).toEqual(initialData);
    expect(result.current.isOpen).toBe(true);
  });

  it('should open dialog with data', () => {
    const { result } = renderHook(() => useDialogWithData<TestData>());
    const testData: TestData = { id: '1', name: 'Test' };
    
    act(() => {
      result.current.open(testData);
    });
    
    expect(result.current.data).toEqual(testData);
    expect(result.current.isOpen).toBe(true);
  });

  it('should close dialog and clear data', () => {
    const initialData: TestData = { id: '1', name: 'Test' };
    const { result } = renderHook(() => useDialogWithData<TestData>(initialData));
    
    act(() => {
      result.current.close();
    });
    
    expect(result.current.data).toBeNull();
    expect(result.current.isOpen).toBe(false);
  });

  it('should update dialog data', () => {
    const { result } = renderHook(() => useDialogWithData<TestData>());
    const initialData: TestData = { id: '1', name: 'Test' };
    const updatedData: TestData = { id: '1', name: 'Updated' };
    
    act(() => {
      result.current.open(initialData);
    });
    expect(result.current.data).toEqual(initialData);
    
    act(() => {
      result.current.update(updatedData);
    });
    expect(result.current.data).toEqual(updatedData);
    expect(result.current.isOpen).toBe(true);
  });

  it('should set data directly', () => {
    const { result } = renderHook(() => useDialogWithData<TestData>());
    const testData: TestData = { id: '1', name: 'Test' };
    
    act(() => {
      result.current.setData(testData);
    });
    
    expect(result.current.data).toEqual(testData);
    expect(result.current.isOpen).toBe(true);
  });

  it('should maintain stable function references', () => {
    const { result, rerender } = renderHook(() => useDialogWithData<TestData>());
    
    const firstOpen = result.current.open;
    const firstClose = result.current.close;
    const firstUpdate = result.current.update;
    
    rerender();
    
    expect(result.current.open).toBe(firstOpen);
    expect(result.current.close).toBe(firstClose);
    expect(result.current.update).toBe(firstUpdate);
  });

  it('should handle type safety', () => {
    const { result } = renderHook(() => useDialogWithData<TestData>());
    const testData: TestData = { id: '1', name: 'Test' };
    
    act(() => {
      result.current.open(testData);
    });
    
    // TypeScript会在编译时确保类型安全
    expect(result.current.data?.id).toBe('1');
    expect(result.current.data?.name).toBe('Test');
  });
});
