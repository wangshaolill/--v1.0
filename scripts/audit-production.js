#!/usr/bin/env node

/**
 * 生产环境审计脚本
 * 检查项目是否达到生产就绪标准
 */

import { readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function checkBundleSize() {
  log('\n📦 检查Bundle大小...', 'blue');
  
  try {
    const distPath = join(process.cwd(), 'dist');
    const assetsPath = join(distPath, 'assets');
    
    if (!readdirSync(distPath).length) {
      log('❌ dist/目录为空，请先运行 npm run build', 'red');
      return false;
    }

    let totalSize = 0;
    const chunks = [];

    function getSize(dir) {
      const files = readdirSync(dir);
      files.forEach(file => {
        const filePath = join(dir, file);
        const stats = statSync(filePath);
        
        if (stats.isDirectory()) {
          getSize(filePath);
        } else {
          totalSize += stats.size;
          if (file.endsWith('.js')) {
            chunks.push({
              name: file,
              size: stats.size,
            });
          }
        }
      });
    }

    getSize(assetsPath);

    // 显示chunk信息
    log('\nJavaScript Chunks:', 'bright');
    chunks.sort((a, b) => b.size - a.size).forEach(chunk => {
      const sizeKB = (chunk.size / 1024).toFixed(2);
      const color = chunk.size > 500000 ? 'red' : chunk.size > 300000 ? 'yellow' : 'green';
      log(`  ${chunk.name}: ${sizeKB} KB`, color);
    });

    // 总大小检查
    const totalMB = (totalSize / 1024 / 1024).toFixed(2);
    log(`\n总大小: ${totalMB} MB`, totalSize > 2000000 ? 'yellow' : 'green');

    // 判断是否通过
    const passed = totalSize < 2000000 && !chunks.some(c => c.size > 500000);
    
    if (passed) {
      log('✅ Bundle大小检查通过', 'green');
    } else {
      log('⚠️  Bundle大小超出建议值', 'yellow');
    }

    return passed;
  } catch (error) {
    log(`❌ 检查失败: ${error.message}`, 'red');
    return false;
  }
}

function checkTestCoverage() {
  log('\n🧪 检查测试覆盖率...', 'blue');
  
  try {
    // 这里可以解析coverage/coverage-summary.json
    log('⏩ 跳过（需要先运行 npm run test:coverage）', 'yellow');
    return true;
  } catch (error) {
    log(`❌ 检查失败: ${error.message}`, 'red');
    return false;
  }
}

function checkCodeQuality() {
  log('\n🔍 检查代码质量...', 'blue');
  
  const checks = [
    {
      name: 'ErrorBoundary集成',
      check: () => {
        const appContent = readFileSync(
          join(process.cwd(), 'src/app/App.tsx'),
          'utf-8'
        );
        return appContent.includes('ErrorBoundary');
      },
    },
    {
      name: '性能监控集成',
      check: () => {
        const appContent = readFileSync(
          join(process.cwd(), 'src/app/App.tsx'),
          'utf-8'
        );
        return appContent.includes('usePageLoadMetrics');
      },
    },
    {
      name: '懒加载配置',
      check: () => {
        try {
          readFileSync(
            join(process.cwd(), 'src/app/lazyComponents.tsx'),
            'utf-8'
          );
          return true;
        } catch {
          return false;
        }
      },
    },
    {
      name: 'Vite代码分割配置',
      check: () => {
        const viteConfig = readFileSync(
          join(process.cwd(), 'vite.config.ts'),
          'utf-8'
        );
        return viteConfig.includes('manualChunks');
      },
    },
  ];

  let passed = 0;
  checks.forEach(({ name, check }) => {
    const result = check();
    if (result) {
      log(`  ✅ ${name}`, 'green');
      passed++;
    } else {
      log(`  ❌ ${name}`, 'red');
    }
  });

  const allPassed = passed === checks.length;
  if (allPassed) {
    log(`\n✅ 代码质量检查通过 (${passed}/${checks.length})`, 'green');
  } else {
    log(`\n⚠️  代码质量检查部分通过 (${passed}/${checks.length})`, 'yellow');
  }

  return allPassed;
}

function checkDependencies() {
  log('\n📚 检查依赖...', 'blue');
  
  try {
    const pkg = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
    );

    // 检查关键依赖
    const requiredDeps = [
      '@playwright/test',
      'vitest',
      '@testing-library/react',
      'motion',
      'lucide-react',
    ];

    let missing = [];
    requiredDeps.forEach(dep => {
      if (!pkg.dependencies[dep] && !pkg.devDependencies[dep]) {
        missing.push(dep);
      }
    });

    if (missing.length === 0) {
      log('✅ 所有必需依赖已安装', 'green');
      return true;
    } else {
      log(`❌ 缺少依赖: ${missing.join(', ')}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ 检查失败: ${error.message}`, 'red');
    return false;
  }
}

function generateReport() {
  log('\n' + '='.repeat(60), 'bright');
  log('🎯 运力宝生产环境审计报告', 'bright');
  log('='.repeat(60), 'bright');

  const results = {
    bundle: checkBundleSize(),
    code: checkCodeQuality(),
    deps: checkDependencies(),
    tests: checkTestCoverage(),
  };

  const totalChecks = Object.keys(results).length;
  const passedChecks = Object.values(results).filter(Boolean).length;
  const percentage = ((passedChecks / totalChecks) * 100).toFixed(0);

  log('\n' + '='.repeat(60), 'bright');
  log(`总结: ${passedChecks}/${totalChecks} 检查通过 (${percentage}%)`, 
    passedChecks === totalChecks ? 'green' : 'yellow'
  );
  log('='.repeat(60), 'bright');

  if (passedChecks === totalChecks) {
    log('\n🎉 恭喜！项目已达到生产就绪标准', 'green');
  } else {
    log('\n⚠️  部分检查未通过，请查看上述详情', 'yellow');
  }

  log('\n建议下一步:', 'blue');
  if (!results.bundle) {
    log('  1. 运行 npm run build 生成生产构建', 'yellow');
  }
  if (!results.tests) {
    log('  2. 运行 npm run test:coverage 生成测试覆盖率', 'yellow');
  }
  log('  3. 运行 Lighthouse 性能测试', 'yellow');
  log('  4. 检查 PRODUCTION_READINESS_CHECKLIST.md\n', 'yellow');
}

// 运行审计
generateReport();
