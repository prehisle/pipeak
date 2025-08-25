// @ts-check
import { test, expect } from '@playwright/test';

test.describe('LaTeX等价表达式测试', () => {
  test.beforeEach(async ({ page }) => {
    // 访问练习页面
    await page.goto('http://localhost:5174/practice');
    // 等待页面加载完成
    await page.waitForSelector('.practice-container', { timeout: 10000 });
  });

  test('测试上下标顺序等价', async ({ page }) => {
    // 找到LaTeX输入框
    const latexInput = await page.locator('.latex-editor textarea');
    
    // 测试用例1: x^2_i 与 x_i^2 等价
    await latexInput.fill('x^2_i');
    await page.click('button:has-text("提交")');
    
    // 等待结果显示
    await page.waitForSelector('.result-message', { timeout: 5000 });
    
    // 检查是否正确识别为等价表达式
    const resultMessage = await page.locator('.result-message');
    const isSuccess = await resultMessage.evaluate(el => el.classList.contains('success'));
    
    expect(isSuccess).toBeTruthy();
    
    // 测试用例2: \sum_{i=1}^{n} 与 \sum_i^n 等价
    await latexInput.fill('\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}');
    await page.click('button:has-text("提交")');
    
    // 等待结果显示
    await page.waitForSelector('.result-message', { timeout: 5000 });
    
    // 检查是否正确识别为等价表达式
    const resultMessage2 = await page.locator('.result-message');
    const isSuccess2 = await resultMessage2.evaluate(el => el.classList.contains('success'));
    
    expect(isSuccess2).toBeTruthy();
  });

  test('测试函数参数等价', async ({ page }) => {
    // 找到LaTeX输入框
    const latexInput = await page.locator('.latex-editor textarea');
    
    // 测试用例: \sin(x) 与 \sin x 等价
    await latexInput.fill('\\sin(x)');
    await page.click('button:has-text("提交")');
    
    // 等待结果显示
    await page.waitForSelector('.result-message', { timeout: 5000 });
    
    // 检查是否正确识别为等价表达式
    const resultMessage = await page.locator('.result-message');
    const isSuccess = await resultMessage.evaluate(el => el.classList.contains('success'));
    
    expect(isSuccess).toBeTruthy();
  });

  test('测试复杂表达式等价', async ({ page }) => {
    // 找到LaTeX输入框
    const latexInput = await page.locator('.latex-editor textarea');
    
    // 测试用例: 积分表达式等价
    await latexInput.fill('\\int_{0}^{\\pi} \\sin(x) dx = 2');
    await page.click('button:has-text("提交")');
    
    // 等待结果显示
    await page.waitForSelector('.result-message', { timeout: 5000 });
    
    // 检查是否正确识别为等价表达式
    const resultMessage = await page.locator('.result-message');
    const isSuccess = await resultMessage.evaluate(el => el.classList.contains('success'));
    
    expect(isSuccess).toBeTruthy();
  });
});