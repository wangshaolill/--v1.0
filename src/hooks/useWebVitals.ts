import { useEffect } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

/**
 * Web Vitals 性能监控Hook
 * 
 * 监控指标：
 * - CLS: Cumulative Layout Shift (累积布局偏移)
 * - INP: Interaction to Next Paint (交互到下次绘制) - 替代FID
 * - FCP: First Contentful Paint (首次内容绘制)
 * - LCP: Largest Contentful Paint (最大内容绘制)
 * - TTFB: Time to First Byte (首字节时间)
 */

// 性能指标阈值（Google推荐）
const THRESHOLDS = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  INP: { good: 200, needsImprovement: 500 }, // INP替代FID
  FCP: { good: 1800, needsImprovement: 3000 },
  LCP: { good: 2500, needsImprovement: 4000 },
  TTFB: { good: 800, needsImprovement: 1800 },
};

type MetricName = 'CLS' | 'INP' | 'FCP' | 'LCP' | 'TTFB';

function getRating(metricName: MetricName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[metricName];
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

function sendToAnalytics(metric: Metric) {
  const rating = getRating(metric.name as MetricName, metric.value);
  
  console.info(`📊 Web Vitals - ${metric.name}:`, {
    value: metric.value,
    rating,
    id: metric.id,
    navigationType: metric.navigationType,
  });

  // 🎯 生产环境：发送到Google Analytics或自定义分析服务
  if (import.meta.env.PROD) {
    // Google Analytics 4 示例
    if (typeof gtag !== 'undefined') {
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
        rating,
      });
    }

    // 也可以发送到自定义API
    // fetch('/api/metrics', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     metric: metric.name,
    //     value: metric.value,
    //     rating,
    //     timestamp: new Date().toISOString(),
    //   }),
    // });
  }
}

export function useWebVitals() {
  useEffect(() => {
    // 监控所有Web Vitals指标
    onCLS(sendToAnalytics);
    onINP(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);

    console.log('✅ Web Vitals监控已启动');
  }, []);
}

/**
 * 获取性能建议
 */
export function getPerformanceSuggestions(metrics: Partial<Record<MetricName, number>>): string[] {
  const suggestions: string[] = [];

  // CLS 建议
  if (metrics.CLS && metrics.CLS > THRESHOLDS.CLS.needsImprovement) {
    suggestions.push('⚠️ CLS过高：检查图片尺寸、避免动态插入内容');
  }

  // INP 建议
  if (metrics.INP && metrics.INP > THRESHOLDS.INP.needsImprovement) {
    suggestions.push('⚠️ INP过高：减少JavaScript执行时间、使用Web Workers');
  }

  // FCP 建议
  if (metrics.FCP && metrics.FCP > THRESHOLDS.FCP.needsImprovement) {
    suggestions.push('⚠️ FCP过高：优化关键渲染路径、减少阻塞资源');
  }

  // LCP 建议
  if (metrics.LCP && metrics.LCP > THRESHOLDS.LCP.needsImprovement) {
    suggestions.push('⚠️ LCP过高：优化图片加载、使用CDN、预加载关键资源');
  }

  // TTFB 建议
  if (metrics.TTFB && metrics.TTFB > THRESHOLDS.TTFB.needsImprovement) {
    suggestions.push('⚠️ TTFB过高：优化服务器响应、使用CDN、启用缓存');
  }

  return suggestions;
}