# 运力宝开发快速入门指南

## 🚀 快速开始

### 1. 运行测试

```bash
# 单元测试
npm run test              # 运行所有测试
npm run test:ui           # 打开测试UI界面
npm run test:coverage     # 生成覆盖率报告

# E2E测试
npm run test:e2e          # 运行端到端测试
npm run test:e2e:ui       # 交互式E2E测试
npm run test:e2e:report   # 查看E2E测试报告
```

### 2. 生产构建

```bash
# 构建生产版本
npm run build

# 验证构建结果
ls -lh dist/assets/js/    # 查看chunk大小
```

### 3. 性能监控

在浏览器Console中查看性能日志：

```javascript
// 查看性能摘要
import { performanceMonitor } from '@/utils/performance';
console.log(performanceMonitor.getSummary());

// 查看所有指标
console.log(performanceMonitor.getMetrics());
```

### 4. 错误追踪

```javascript
// 查看错误统计
import { errorTracker } from '@/utils/errorTracking';
console.log(errorTracker.getStatistics());

// 查看所有错误
console.log(errorTracker.getErrors());
```

---

## 📁 项目结构

```
/src
├── app/
│   ├── App.tsx                    # 主应用组件
│   ├── lazyComponents.tsx         # 懒加载配置
│   └── components/                # 所有组件
│       ├── __tests__/             # 组件测试
│       ├── FindVehicle.tsx        # 找车模块
│       ├── Orders.tsx             # 订单模块
│       ├── Waybills.tsx           # 运单模块
│       └── ...
├── hooks/                         # 自定义Hooks
│   ├── useOrders.ts               # 订单管理
│   ├── useWaybills.ts             # 运单管理
│   └── usePerformance.ts          # 性能监控
├── utils/                         # 工具函数
│   ├── performance.ts             # 性能监控工具
│   ├── errorTracking.ts           # 错误追踪工具
│   └── codeAudit.ts               # 代码审计工具
├── types/                         # TypeScript类型
└── data/                          # Mock数据

/e2e                               # E2E测试
├── order-flow.spec.ts             # 订单流程测试

/                                  # 配置文件
├── vite.config.ts                 # Vite配置（代码分割）
├── vitest.config.ts               # Vitest配置
├── playwright.config.ts           # Playwright配置
└── package.json                   # 依赖和脚本
```

---

## 🧩 核心功能模块

### 1. 订单管理
- **文件：** `src/app/components/Orders.tsx`
- **Hook：** `src/hooks/useOrders.ts`
- **功能：**
  - 一口价订单
  - 竞价订单
  - 多车运输
  - 订单状态流转

### 2. 运单管理
- **文件：** `src/app/components/Waybills.tsx`
- **Hook：** `src/hooks/useWaybills.ts`
- **功能：**
  - 运单生成
  - 状态追踪
  - 琼州海峡过海节点
  - 签收确认

### 3. 车辆配置
- **文件：** `src/app/components/VehicleTypeSelector.tsx`
- **功能：**
  - 手动指定车辆数（1-10辆）
  - 每辆车独立配置车长车型
  - 多车订单支持

---

## 🎯 性能优化要点

### 1. 代码分割
所有大型组件已配置懒加载：

```typescript
import { LazyOrderDetail } from '@/app/lazyComponents';

// 使用时自动带Suspense
<LazyOrderDetail orderId={id} />
```

### 2. 性能监控
在组件中添加性能追踪：

```typescript
import { usePerformance } from '@/hooks/usePerformance';

function MyComponent() {
  const { measureInteraction } = usePerformance('MyComponent');
  
  const handleClick = () => {
    const endMeasure = measureInteraction('button-click');
    // ... 执行操作
    endMeasure();
  };
}
```

### 3. 错误处理
使用安全执行包装异步操作：

```typescript
import { safeExecute } from '@/utils/errorTracking';

const data = await safeExecute(
  async () => await fetchData(),
  'Failed to fetch data',
  'medium' // 错误级别
);
```

---

## ✅ 生产部署检查清单

### 构建前
- [ ] 所有测试通过 (`npm run test`)
- [ ] E2E测试通过 (`npm run test:e2e`)
- [ ] 测试覆盖率达标 (`npm run test:coverage`)
- [ ] 无TypeScript错误
- [ ] 无ESLint警告（如已配置）

### 构建时
- [ ] 执行生产构建 (`npm run build`)
- [ ] 检查Bundle大小
  - Main chunk < 500KB
  - Vendor chunks < 600KB
  - 总大小 < 2MB
- [ ] 检查是否有重复依赖

### 部署前
- [ ] 使用Lighthouse测试性能（目标 > 90分）
- [ ] 验证所有环境变量
- [ ] 测试生产构建本地运行
- [ ] 检查错误监控配置

### 部署后
- [ ] 验证首屏加载时间 < 3s
- [ ] 验证所有核心功能
- [ ] 监控错误日志
- [ ] 监控性能指标

---

## 🐛 常见问题

### Q: 如何查看性能指标？
**A:** 打开浏览器Console，性能指标会自动输出（开发环境）。

### Q: 如何添加新的测试？
**A:** 
```bash
# 组件测试
/src/app/components/__tests__/YourComponent.test.tsx

# E2E测试
/e2e/your-flow.spec.ts
```

### Q: Bundle太大怎么办？
**A:** 
1. 检查是否有未使用的依赖 (`npx depcheck`)
2. 使用Bundle分析工具 (`npx vite-bundle-visualizer`)
3. 确保大型组件已懒加载

### Q: 测试失败怎么办？
**A:** 
1. 查看测试输出的错误信息
2. 使用 `npm run test:ui` 进入调试模式
3. 检查组件props和mock数据

---

## 📚 推荐资源

### 文档
- [生产就绪检查清单](/PRODUCTION_READINESS_CHECKLIST.md)
- [优化报告](/PRODUCTION_OPTIMIZATION_REPORT.md)

### 工具
- [Vitest文档](https://vitest.dev/)
- [Playwright文档](https://playwright.dev/)
- [Vite文档](https://vitejs.dev/)

### 性能
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

## 🤝 贡献指南

### 开发流程
1. 创建功能分支
2. 编写代码 + 测试
3. 运行测试确保通过
4. 提交Pull Request

### 代码规范
- 遵循TypeScript类型定义
- 所有新功能必须有测试
- 性能敏感代码添加性能监控
- 重要操作添加错误处理

---

**更新时间：** 2026-02-12  
**文档版本：** v1.0.0
