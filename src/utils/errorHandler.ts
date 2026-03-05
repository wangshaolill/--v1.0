/**
 * 统一错误处理工具
 */

import { toast } from "sonner";

// 错误类型
export enum ErrorType {
  NETWORK = "network",
  VALIDATION = "validation",
  BUSINESS = "business",
  UNKNOWN = "unknown",
}

// 错误信息接口
export interface AppError {
  type: ErrorType;
  message: string;
  description?: string;
  originalError?: unknown;
}

/**
 * 创建应用错误
 */
export function createError(
  type: ErrorType,
  message: string,
  description?: string,
  originalError?: unknown
): AppError {
  return {
    type,
    message,
    description,
    originalError,
  };
}

/**
 * 处理错误并显示Toast
 */
export function handleError(error: AppError | Error | unknown): void {
  if (isAppError(error)) {
    toast.error(error.message, {
      description: error.description,
    });
    
    // 记录错误到控制台（生产环境可以发送到监控系统）
    console.error(`[${error.type}]`, error.message, error.originalError);
  } else if (error instanceof Error) {
    toast.error("操作失败", {
      description: error.message,
    });
    console.error(error);
  } else {
    toast.error("未知错误", {
      description: "请稍后重试",
    });
    console.error("Unknown error:", error);
  }
}

/**
 * 检查是否为应用错误
 */
function isAppError(error: unknown): error is AppError {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    "message" in error
  );
}

/**
 * 异步函数错误包装器
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorMessage?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (errorMessage) {
        handleError(
          createError(
            ErrorType.UNKNOWN,
            errorMessage,
            error instanceof Error ? error.message : undefined,
            error
          )
        );
      } else {
        handleError(error);
      }
      throw error;
    }
  }) as T;
}

/**
 * 同步函数错误包装器
 */
export function withSyncErrorHandler<T extends (...args: any[]) => any>(
  fn: T,
  errorMessage?: string
): T {
  return ((...args: Parameters<T>) => {
    try {
      return fn(...args);
    } catch (error) {
      if (errorMessage) {
        handleError(
          createError(
            ErrorType.UNKNOWN,
            errorMessage,
            error instanceof Error ? error.message : undefined,
            error
          )
        );
      } else {
        handleError(error);
      }
      throw error;
    }
  }) as T;
}

/**
 * 常用错误创建函数
 */
export const Errors = {
  network: (message = "网络请求失败", description?: string) =>
    createError(ErrorType.NETWORK, message, description),
  
  validation: (message = "数据验证失败", description?: string) =>
    createError(ErrorType.VALIDATION, message, description),
  
  business: (message: string, description?: string) =>
    createError(ErrorType.BUSINESS, message, description),
  
  unknown: (message = "未知错误", description?: string) =>
    createError(ErrorType.UNKNOWN, message, description),
};
