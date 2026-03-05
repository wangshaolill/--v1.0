/**
 * 代码审计工具
 * 帮助识别性能问题和潜在优化点
 */

/**
 * 检测未优化的大型列表渲染
 */
export function detectLargeListRendering(itemCount: number, threshold = 50): boolean {
  if (itemCount > threshold && import.meta.env.DEV) {
    console.warn(
      `⚠️ 检测到大型列表渲染 (${itemCount} items)。` +
      `建议使用虚拟滚动（react-window）优化性能。`
    );
    return true;
  }
  return false;
}

/**
 * 检测过度重渲染
 */
export function detectExcessiveRerender(renderCount: number, threshold = 10): boolean {
  if (renderCount > threshold && import.meta.env.DEV) {
    console.warn(
      `⚠️ 组件重渲染次数过多 (${renderCount} times)。` +
      `建议使用 useMemo/useCallback 优化。`
    );
    return true;
  }
  return false;
}

/**
 * 检测大型Bundle
 */
export function detectLargeBundle(size: number, threshold = 500000): boolean {
  if (size > threshold && import.meta.env.DEV) {
    console.warn(
      `⚠️ Bundle大小超标 (${(size / 1024).toFixed(2)}KB)。` +
      `建议使用代码分割优化。`
    );
    return true;
  }
  return false;
}

/**
 * 内存泄漏检测（简化版）
 */
export class MemoryLeakDetector {
  private listeners: Map<string, number> = new Map();

  trackListener(name: string) {
    const count = this.listeners.get(name) || 0;
    this.listeners.set(name, count + 1);

    if (count > 10 && import.meta.env.DEV) {
      console.warn(
        `⚠️ 可能存在内存泄漏：${name} 监听器数量异常 (${count + 1})`
      );
    }
  }

  untrackListener(name: string) {
    const count = this.listeners.get(name) || 0;
    if (count > 0) {
      this.listeners.set(name, count - 1);
    }
  }

  getReport() {
    return Array.from(this.listeners.entries())
      .filter(([, count]) => count > 0)
      .map(([name, count]) => ({ name, count }));
  }
}

export const memoryLeakDetector = new MemoryLeakDetector();

/**
 * 性能审计报告
 */
export function generatePerformanceAudit() {
  const report = {
    timestamp: new Date().toISOString(),
    warnings: [] as string[],
    suggestions: [] as string[],
  };

  // 检查性能API支持
  if (typeof performance === 'undefined') {
    report.warnings.push('Performance API 不可用');
    return report;
  }

  // 获取资源加载信息
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  // 检测慢速资源
  const slowResources = resources.filter(r => r.duration > 1000);
  if (slowResources.length > 0) {
    report.warnings.push(
      `发现 ${slowResources.length} 个加载缓慢的资源 (>1s)`
    );
    slowResources.forEach(r => {
      report.suggestions.push(
        `优化资源: ${r.name} (${r.duration.toFixed(0)}ms)`
      );
    });
  }

  // 检测大型资源
  const largeResources = resources.filter(r => r.transferSize && r.transferSize > 500000);
  if (largeResources.length > 0) {
    report.warnings.push(
      `发现 ${largeResources.length} 个大型资源 (>500KB)`
    );
    largeResources.forEach(r => {
      report.suggestions.push(
        `压缩资源: ${r.name} (${((r.transferSize || 0) / 1024).toFixed(2)}KB)`
      );
    });
  }

  // 内存泄漏检测
  const leakReport = memoryLeakDetector.getReport();
  if (leakReport.length > 0) {
    report.warnings.push('检测到可能的内存泄漏');
    leakReport.forEach(({ name, count }) => {
      report.suggestions.push(`清理监听器: ${name} (${count} 个)`);
    });
  }

  return report;
}
