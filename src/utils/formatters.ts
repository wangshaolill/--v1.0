/**
 * 格式化工具函数
 * 统一的数据格式化方法
 */

/**
 * 提取城市名称
 * @example extractCity("深圳市南山区科技园") => "深圳市"
 */
export function extractCity(address?: string): string {
  if (!address) return '-';
  
  const cityMatch = address.match(/(.*?[市区县])/);
  return cityMatch ? cityMatch[1] : address.substring(0, 10);
}

/**
 * 格式化城市+区域，格式：XX市·XX区
 * @example formatCityDistrict("广东省深圳市南山区科技园") => "深圳市·南山区"
 */
export function formatCityDistrict(address?: string): string {
  if (!address) return '-';
  
  // 匹配 "XX市XX区" 格式
  const cityDistrictMatch = address.match(/(.*?市)(.*?[区县])/);
  if (cityDistrictMatch) {
    return `${cityDistrictMatch[1]}·${cityDistrictMatch[2]}`;
  }
  
  // 如果只有市，返回市
  const cityMatch = address.match(/(.*?市)/);
  if (cityMatch) return cityMatch[1];
  
  // 如果只有区县，返回区县
  const districtMatch = address.match(/(.*?[区县])/);
  if (districtMatch) return districtMatch[1];
  
  // 都没有匹配到，返回前8个字符
  return address.substring(0, 8);
}

/**
 * 格式化完整地址（简化显示）
 * @example formatAddress("广东省深圳市南山区科技园") => "深圳市·南山区"
 */
export function formatAddress(address?: string): string {
  return formatCityDistrict(address);
}

/**
 * 格式化手机号为 138****1234
 */
export function formatPhone(phone?: string): string {
  if (!phone || phone.length !== 11) return phone || '-';
  return `${phone.substring(0, 3)}****${phone.substring(7)}`;
}

/**
 * 格式化金额
 * @example formatPrice(8000) => "¥8,000"
 */
export function formatPrice(price?: number): string {
  if (price === undefined || price === null) return '-';
  return `¥${price.toLocaleString()}`;
}

/**
 * 格式化日期
 */
export function formatDate(
  date: string | Date,
  format: 'date' | 'datetime' | 'time' = 'datetime'
): string {
  const d = new Date(date);
  
  if (format === 'date') {
    return d.toLocaleDateString('zh-CN');
  }
  
  if (format === 'time') {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 格式化重量
 * @example formatWeight(10.5) => "10.5吨"
 */
export function formatWeight(weight?: number): string {
  if (weight === undefined || weight === null) return '-';
  return `${weight}吨`;
}

/**
 * 格式化车型
 * @example formatVehicle("4.2米厢式货车", 10) => "4.2米厢式货车（10吨）"
 */
export function formatVehicle(vehicleType?: string, capacity?: number): string {
  if (!vehicleType) return '-';
  if (!capacity) return vehicleType;
  return `${vehicleType}（${capacity}吨）`;
}

/**
 * 格式化订单号
 * @example formatOrderNumber("YLB12345678") => "YLB-1234-5678"
 */
export function formatOrderNumber(orderNumber?: string): string {
  if (!orderNumber) return '-';
  if (orderNumber.length === 11 && orderNumber.startsWith('YLB')) {
    return `${orderNumber.slice(0, 3)}-${orderNumber.slice(3, 7)}-${orderNumber.slice(7)}`;
  }
  return orderNumber;
}