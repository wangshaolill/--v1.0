import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { storage, STORAGE_KEYS } from '@/utils/storage';

describe('storage utility', () => {
  beforeEach(() => {
    // 清空localStorage
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('set and get', () => {
    it('应该能够存储和获取字符串', () => {
      const key = 'test_string';
      const value = 'Hello World';

      storage.set(key, value);
      const retrieved = storage.get<string>(key, '');

      expect(retrieved).toBe(value);
    });

    it('应该能够存储和获取数字', () => {
      const key = 'test_number';
      const value = 42;

      storage.set(key, value);
      const retrieved = storage.get<number>(key, 0);

      expect(retrieved).toBe(value);
    });

    it('应该能够存储和获取布尔值', () => {
      const key = 'test_boolean';
      const value = true;

      storage.set(key, value);
      const retrieved = storage.get<boolean>(key, false);

      expect(retrieved).toBe(value);
    });

    it('应该能够存储和获取对象', () => {
      const key = 'test_object';
      const value = { name: '张三', age: 30 };

      storage.set(key, value);
      const retrieved = storage.get<typeof value>(key, { name: '', age: 0 });

      expect(retrieved).toEqual(value);
    });

    it('应该能够存储和获取数组', () => {
      const key = 'test_array';
      const value = ['a', 'b', 'c'];

      storage.set(key, value);
      const retrieved = storage.get<string[]>(key, []);

      expect(retrieved).toEqual(value);
    });

    it('当键不存在时应该返回默认值', () => {
      const key = 'non_existent_key';
      const defaultValue = 'default';

      const retrieved = storage.get(key, defaultValue);

      expect(retrieved).toBe(defaultValue);
    });
  });

  describe('remove', () => {
    it('应该能够删除指定的键', () => {
      const key = 'test_remove';
      const value = 'test value';

      storage.set(key, value);
      expect(storage.get(key, '')).toBe(value);

      storage.remove(key);
      expect(storage.get(key, 'default')).toBe('default');
    });
  });

  describe('clear', () => {
    it('应该能够清空所有存储', () => {
      storage.set('key1', 'value1');
      storage.set('key2', 'value2');
      storage.set('key3', 'value3');

      storage.clear();

      expect(storage.get('key1', 'default')).toBe('default');
      expect(storage.get('key2', 'default')).toBe('default');
      expect(storage.get('key3', 'default')).toBe('default');
    });
  });

  describe('STORAGE_KEYS', () => {
    it('应该有所有必需的存储键', () => {
      expect(STORAGE_KEYS.ONBOARDING).toBeDefined();
      expect(STORAGE_KEYS.NEW_USER_MODAL).toBeDefined();
      expect(STORAGE_KEYS.FAVORITED_CARGOS).toBeDefined();
      expect(STORAGE_KEYS.SAVED_ADDRESSES).toBeDefined();
    });

    it('存储键应该是字符串类型', () => {
      Object.values(STORAGE_KEYS).forEach((key) => {
        expect(typeof key).toBe('string');
      });
    });

    it('存储键应该有合理的命名前缀', () => {
      Object.values(STORAGE_KEYS).forEach((key) => {
        expect(key).toMatch(/^yunlibao_/);
      });
    });
  });

  describe('错误处理', () => {
    it('当localStorage不可用时应该优雅降级', () => {
      // 模拟localStorage错误
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('localStorage is not available');
      };

      // 不应该抛出错误
      expect(() => storage.set('test', 'value')).not.toThrow();

      // 恢复
      localStorage.setItem = originalSetItem;
    });

    it('当数据解析失败时应该返回默认值', () => {
      const key = 'invalid_json';
      localStorage.setItem(key, 'invalid{json}');

      const retrieved = storage.get(key, 'default');
      expect(retrieved).toBe('default');
    });
  });
});
