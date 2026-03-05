import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { errorTracker } from "@/utils/errorTracking";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 全局错误边界组件
 * 捕获子组件树中的JavaScript错误，显示友好的错误UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误到错误追踪系统
    errorTracker.logComponentError(error, errorInfo, 'high');
    
    // 开发环境输出
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用自定义UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full shadow-xl">
            <CardContent className="pt-6">
              {/* 错误图标 */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* 错误标题 */}
              <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
                出错了
              </h1>
              
              {/* 错误描述 */}
              <p className="text-center text-gray-600 mb-6">
                应用遇到了一个意外错误，请尝试刷新页面或联系技术支持。
              </p>

              {/* 错误详情（开发环境显示） */}
              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-mono text-red-800 mb-2">
                    <strong>错误信息：</strong>
                  </p>
                  <p className="text-xs font-mono text-red-600 break-all">
                    {this.state.error.toString()}
                  </p>
                  
                  {this.state.errorInfo && (
                    <>
                      <p className="text-sm font-mono text-red-800 mt-4 mb-2">
                        <strong>错误堆栈：</strong>
                      </p>
                      <pre className="text-xs font-mono text-red-600 overflow-auto max-h-40 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 bg-gradient-to-r from-[#FF6034] to-[#FF4444] hover:from-[#FF4444] hover:to-[#FF6034]"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重试
                </Button>
                
                <Button
                  onClick={() => window.location.href = "/"}
                  variant="outline"
                  className="flex-1"
                >
                  返回首页
                </Button>
              </div>

              {/* 提示信息 */}
              <p className="text-xs text-center text-gray-500 mt-6">
                如果问题持续出现，请联系技术支持：support@yunlibao.com
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}