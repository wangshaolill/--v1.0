/**
 * 性能监控工具
 * 用于追踪关键性能指标和用户体验数据
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    this.initializeWebVitals();
  }

  /**
   * 初始化Web Vitals监控
   */
  private initializeWebVitals() {
    if (typeof window === 'undefined') return;

    // 监控Largest Contentful Paint (LCP)
    this.observePerformance('largest-contentful-paint', (entry) => {
      this.recordMetric('LCP', entry.renderTime || entry.loadTime);
    });

    // 监控First Input Delay (FID)
    this.observePerformance('first-input', (entry) => {
      this.recordMetric('FID', entry.processingStart - entry.startTime);
    });

    // 监控Cumulative Layout Shift (CLS)
    let clsScore = 0;
    this.observePerformance('layout-shift', (entry) => {
      if (!(entry as any).hadRecentInput) {
        clsScore += (entry as any).value;
        this.recordMetric('CLS', clsScore);
      }
    });
  }

  /**
   * 观察性能指标
   */
  private observePerformance(
    entryType: string,
    callback: (entry: PerformanceEntry) => void
  ) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback);
      });
      observer.observe({ type: entryType, buffered: true });
      this.observers.set(entryType, observer);
    } catch (e) {
      // PerformanceObserver不支持时静默失败
      console.warn(`PerformanceObserver for ${entryType} not supported`);
    }
  }

  /**
   * 记录性能指标
   */
  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // 开发环境下输出到控制台
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`, metadata);
    }

    // 限制存储数量，避免内存泄漏
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-50);
    }
  }

  /**
   * 测量组件渲染时间
   */
  measureComponent(componentName: string, callback: () => void) {
    const startTime = performance.now();
    callback();
    const duration = performance.now() - startTime;
    this.recordMetric(`Component:${componentName}`, duration);
  }

  /**
   * 测量异步操作
   */
  async measureAsync<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      this.recordMetric(`Async:${operationName}`, duration, { success: true });
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(`Async:${operationName}`, duration, {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * 获取所有指标
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * 获取指标摘要
   */
  getSummary() {
    const summary: Record<string, { avg: number; max: number; min: number; count: number }> = {};

    this.metrics.forEach((metric) => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          avg: 0,
          max: -Infinity,
          min: Infinity,
          count: 0,
        };
      }

      const s = summary[metric.name];
      s.count++;
      s.max = Math.max(s.max, metric.value);
      s.min = Math.min(s.min, metric.value);
      s.avg = (s.avg * (s.count - 1) + metric.value) / s.count;
    });

    return summary;
  }

  /**
   * 清理所有观察器
   */
  cleanup() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
    this.metrics = [];
  }
}

// 单例实例
export const performanceMonitor = new PerformanceMonitor();

/**
 * React Hook: 测量组件渲染性能
 */
export function usePerformanceMonitor(componentName: string) {
  if (import.meta.env.DEV) {
    const renderTime = performance.now();
    performanceMonitor.recordMetric(`Render:${componentName}`, renderTime);
  }
}
