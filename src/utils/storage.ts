/**
 * 业务相关的存储键名
 */
export const STORAGE_KEYS = {
  ONBOARDING: 'hasSeenOnboarding',
  SAVED_ADDRESSES: 'savedAddresses',
  NEW_USER_MODAL: 'hasSeenNewUserModal',
  USER_PROFILE: 'userProfile',
  ORDERS: 'orders',
  WAYBILLS: 'waybills',
  FILTERS: 'filters',
  FAVORITED_CARGOS: 'favoritedCargos', // 收藏的货源
} as const;

/**
 * 类型安全的 localStorage 封装工具
 */
export const storage = {
  /**
   * 读取数据
   * @param key 存储键名
   * @param defaultValue 默认值（当键不存在或解析失败时返回）
   * @returns 解析后的数据或默认值
   */
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Failed to get item from localStorage: ${key}`, error);
      return defaultValue;
    }
  },

  /**
   * 保存数据
   * @param key 存储键名
   * @param value 要保存的数据（会自动序列化为 JSON）
   */
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set item to localStorage: ${key}`, error);
    }
  },

  /**
   * 删除数据
   * @param key 存储键名
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item from localStorage: ${key}`, error);
    }
  },

  /**
   * 清空所有数据
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage', error);
    }
  },
};