import { useEffect, useCallback, useRef } from 'react';
import { performanceMonitor } from '@/utils/performance';

/**
 * 性能监控Hook
 * 自动追踪组件渲染和交互性能
 */
export function usePerformance(componentName: string) {
  const mountTime = useRef(Date.now());
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current++;
    
    // 记录首次渲染时间
    if (renderCount.current === 1) {
      const mountDuration = Date.now() - mountTime.current;
      performanceMonitor.recordMetric(`Mount:${componentName}`, mountDuration);
    }

    // 记录重渲染
    if (renderCount.current > 1 && import.meta.env.DEV) {
      performanceMonitor.recordMetric(`Rerender:${componentName}`, renderCount.current);
    }
  });

  // 测量用户交互性能
  const measureInteraction = useCallback((interactionName: string) => {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      performanceMonitor.recordMetric(
        `Interaction:${componentName}:${interactionName}`,
        duration
      );
    };
  }, [componentName]);

  return { measureInteraction };
}

/**
 * 异步操作性能监控Hook
 */
export function useAsyncPerformance() {
  const measureAsync = useCallback(
    async <T,>(operationName: string, operation: () => Promise<T>): Promise<T> => {
      return performanceMonitor.measureAsync(operationName, operation);
    },
    []
  );

  return { measureAsync };
}

/**
 * 页面加载性能监控Hook
 */
export function usePageLoadMetrics() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 等待页面完全加载
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (perfData) {
        // DNS查询时间
        performanceMonitor.recordMetric(
          'DNS',
          perfData.domainLookupEnd - perfData.domainLookupStart
        );

        // TCP连接时间
        performanceMonitor.recordMetric(
          'TCP',
          perfData.connectEnd - perfData.connectStart
        );

        // 首字节时间(TTFB)
        performanceMonitor.recordMetric(
          'TTFB',
          perfData.responseStart - perfData.requestStart
        );

        // DOM解析时间
        performanceMonitor.recordMetric(
          'DOMParse',
          perfData.domComplete - perfData.domInteractive
        );

        // 总加载时间
        performanceMonitor.recordMetric(
          'PageLoad',
          perfData.loadEventEnd - perfData.fetchStart
        );
      }
    });
  }, []);
}
