/**
 * 错误追踪和日志系统
 * 用于收集和分析应用错误
 */

export interface ErrorLog {
  id: string;
  timestamp: number;
  message: string;
  stack?: string;
  componentStack?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  userAgent?: string;
  url?: string;
}

class ErrorTracker {
  private errors: ErrorLog[] = [];
  private maxErrors = 50;

  constructor() {
    this.initializeGlobalHandlers();
  }

  /**
   * 初始化全局错误处理器
   */
  private initializeGlobalHandlers() {
    if (typeof window === 'undefined') return;

    // 捕获未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        new Error(event.reason?.message || 'Unhandled Promise Rejection'),
        'high',
        {
          type: 'unhandledRejection',
          reason: event.reason,
        }
      );
    });

    // 捕获全局错误
    window.addEventListener('error', (event) => {
      this.logError(event.error || new Error(event.message), 'high', {
        type: 'globalError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });
  }

  /**
   * 记录错误
   */
  logError(
    error: Error,
    severity: ErrorLog['severity'] = 'medium',
    metadata?: Record<string, any>
  ) {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack,
      severity,
      metadata,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    this.errors.push(errorLog);

    // 限制存储数量
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // 开发环境输出到控制台
    if (import.meta.env.DEV) {
      const emoji = this.getSeverityEmoji(severity);
      console.error(`${emoji} [${severity.toUpperCase()}]`, error.message, {
        error,
        metadata,
      });
    }

    // 生产环境可以发送到远程日志服务
    if (import.meta.env.PROD && severity === 'critical') {
      this.sendToRemote(errorLog);
    }
  }

  /**
   * 记录React组件错误
   */
  logComponentError(
    error: Error,
    errorInfo: { componentStack?: string },
    severity: ErrorLog['severity'] = 'medium'
  ) {
    this.logError(error, severity, {
      type: 'componentError',
      componentStack: errorInfo.componentStack,
    });
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取严重性emoji
   */
  private getSeverityEmoji(severity: ErrorLog['severity']): string {
    const emojiMap = {
      low: '⚠️',
      medium: '🔶',
      high: '🔴',
      critical: '💥',
    };
    return emojiMap[severity];
  }

  /**
   * 发送到远程服务（模拟）
   */
  private sendToRemote(errorLog: ErrorLog) {
    // 这里可以集成Sentry、LogRocket等服务
    console.log('📤 Sending error to remote service:', errorLog);
    
    // 示例：发送到后端API
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorLog),
    // });
  }

  /**
   * 获取所有错误日志
   */
  getErrors(): ErrorLog[] {
    return [...this.errors];
  }

  /**
   * 获取错误统计
   */
  getStatistics() {
    const stats = {
      total: this.errors.length,
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
      recentErrors: this.errors.slice(-5),
    };

    this.errors.forEach((error) => {
      stats.bySeverity[error.severity]++;
    });

    return stats;
  }

  /**
   * 清除所有错误日志
   */
  clearErrors() {
    this.errors = [];
  }
}

// 单例实例
export const errorTracker = new ErrorTracker();

/**
 * 安全执行函数，自动捕获错误
 */
export async function safeExecute<T>(
  fn: () => Promise<T> | T,
  errorMessage = 'Operation failed',
  severity: ErrorLog['severity'] = 'medium'
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    errorTracker.logError(
      error instanceof Error ? error : new Error(errorMessage),
      severity,
      { originalError: error }
    );
    return null;
  }
}
