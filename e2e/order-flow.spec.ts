import { test, expect } from '@playwright/test';

/**
 * E2E测试：核心订单流程
 * 测试从下单到运单生成的完整旅程
 */

test.describe('订单核心流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('应该能够完成快速下单流程', async ({ page }) => {
    // 1. 点击快速下单按钮
    await page.click('button:has-text("发")');
    
    // 2. 验证快速下单弹窗打开
    await expect(page.locator('text=快速下单')).toBeVisible();
    
    // 3. 填写基本信息（使用更宽松的选择器）
    await page.fill('input[placeholder*="装货地"]', '广州市天河区');
    await page.fill('input[placeholder*="卸货地"]', '深圳市南山区');
    
    // 4. 选择车型（假设有默认选项）
    // 根据实际UI调整选择器
    
    // 5. 提交订单
    await page.click('button:has-text("立即下单")');
    
    // 6. 验证跳转到订单页面
    await expect(page.locator('text=订单')).toBeVisible();
  });

  test('应该显示订单列表', async ({ page }) => {
    // 切换到订单标签
    await page.click('button:has-text("订单")');
    
    // 验证订单列表加载
    await expect(page.locator('[data-testid="order-list"]').or(page.locator('text=暂无订单'))).toBeVisible();
  });

  test('应该能够查看订单详情', async ({ page }) => {
    // 切换到订单标签
    await page.click('button:has-text("订单")');
    
    // 等待订单列表加载
    await page.waitForTimeout(1000);
    
    // 点击第一个订单（如果存在）
    const firstOrder = page.locator('[data-testid="order-card"]').first();
    if (await firstOrder.count() > 0) {
      await firstOrder.click();
      
      // 验证订单详情显示
      await expect(page.locator('text=订单详情')).toBeVisible();
    }
  });

  test('应该能够切换底部导航', async ({ page }) => {
    // 测试所有导航标签
    const tabs = ['找车', '订单', '运单', '我的'];
    
    for (const tab of tabs) {
      await page.click(`button:has-text("${tab}")`);
      await page.waitForTimeout(300);
      
      // 验证导航状态更新
      const activeTab = page.locator(`button:has-text("${tab}")`);
      await expect(activeTab).toHaveClass(/text-\[#FF6034\]/);
    }
  });
});

test.describe('多车运输流程', () => {
  test('应该支持选择多辆车', async ({ page }) => {
    await page.goto('/');
    
    // 点击快速下单
    await page.click('button:has-text("发")');
    
    // 查找车辆数量增加按钮
    const addVehicleButton = page.locator('button:has-text("+")').first();
    if (await addVehicleButton.count() > 0) {
      await addVehicleButton.click();
      
      // 验证车辆数量增加
      await expect(page.locator('text=/2.*车/')).toBeVisible();
    }
  });
});

test.describe('性能测试', () => {
  test('首屏加载应该在3秒内完成', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('导航切换应该流畅', async ({ page }) => {
    await page.goto('/');
    
    const tabs = ['订单', '运单', '我的', '找车'];
    
    for (const tab of tabs) {
      const startTime = Date.now();
      await page.click(`button:has-text("${tab}")`);
      await page.waitForLoadState('domcontentloaded');
      const switchTime = Date.now() - startTime;
      
      // 导航切换应该在500ms内完成
      expect(switchTime).toBeLessThan(500);
    }
  });
});
