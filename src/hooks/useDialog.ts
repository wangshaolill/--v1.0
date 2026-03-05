import { useState, useCallback } from "react";

/**
 * 统一的弹窗管理Hook
 * 用于管理布尔类型的弹窗状态（打开/关闭）
 */
export function useDialog(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
}

/**
 * 带数据的弹窗管理Hook
 * 用于管理需要传递数据的弹窗（如编辑、详情等）
 */
export function useDialogWithData<T = unknown>(initialData: T | null = null) {
  const [data, setData] = useState<T | null>(initialData);

  const open = useCallback((newData: T) => {
    setData(newData);
  }, []);

  const close = useCallback(() => {
    setData(null);
  }, []);

  const update = useCallback((newData: T) => {
    setData(newData);
  }, []);

  return {
    data,
    isOpen: data !== null,
    open,
    close,
    update,
    setData,
  };
}
