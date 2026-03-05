import { useState, useEffect, useCallback } from "react";
import { storage } from "@/utils/storage";

/**
 * 数据持久化Hook
 * 自动将状态同步到localStorage，刷新页面不丢失数据
 * 
 * @param key - localStorage的键名
 * @param initialValue - 初始值
 * @returns [value, setValue] - 状态值和更新函数
 * 
 * @example
 * const [orders, setOrders] = usePersistence('orders', MOCK_ORDERS);
 */
export function usePersistence<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // 初始化：从localStorage读取或使用初始值
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = storage.get(key);
      return stored !== null ? stored : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from storage:`, error);
      return initialValue;
    }
  });

  // 更新函数：支持函数式更新
  const setPersistentValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((prevValue) => {
        const valueToStore =
          typeof newValue === "function"
            ? (newValue as (prev: T) => T)(prevValue)
            : newValue;

        try {
          // 保存到localStorage
          storage.set(key, valueToStore);
        } catch (error) {
          console.error(`Error saving ${key} to storage:`, error);
        }

        return valueToStore;
      });
    },
    [key]
  );

  // 监听其他标签页的变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          const newValue = JSON.parse(e.newValue);
          setValue(newValue);
        } catch (error) {
          console.error(`Error parsing storage event for ${key}:`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [value, setPersistentValue];
}

/**
 * 清除指定key的持久化数据
 */
export function clearPersistence(key: string): void {
  storage.remove(key);
}

/**
 * 清除所有持久化数据
 */
export function clearAllPersistence(): void {
  localStorage.clear();
}
