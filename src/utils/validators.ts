/**
 * 验证工具函数
 * 统一的数据验证方法
 */

/**
 * 验证手机号
 * @example validatePhone("13812345678") => true
 */
export function validatePhone(phone: string): boolean {
  const regex = /^1[3-9]\d{9}$/;
  return regex.test(phone);
}

/**
 * 验证邮箱
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * 验证身份证号
 */
export function validateIdCard(idCard: string): boolean {
  const regex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return regex.test(idCard);
}

/**
 * 验证车牌号
 * @example validatePlateNumber("粤B12345") => true
 */
export function validatePlateNumber(plate: string): boolean {
  const regex = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{5}$/;
  return regex.test(plate);
}

/**
 * 验证重量（必须>0）
 */
export function validateWeight(weight: number): boolean {
  return weight > 0 && weight <= 100; // 假设最大100吨
}

/**
 * 验证价格（必须>=0）
 */
export function validatePrice(price: number): boolean {
  return price >= 0 && price <= 1000000; // 假设最大100万
}

/**
 * 验证地址（最少5个字符）
 */
export function validateAddress(address: string): boolean {
  return address.trim().length >= 5;
}

/**
 * 验证姓名（2-20个字符，中文或字母）
 */
export function validateName(name: string): boolean {
  const regex = /^[\u4e00-\u9fa5a-zA-Z]{2,20}$/;
  return regex.test(name);
}
