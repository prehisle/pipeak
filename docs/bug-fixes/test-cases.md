# 上下标顺序修复测试用例

## 测试目标
验证修复后的验证函数能正确处理上下标顺序的等价性问题。

## 测试用例

### 基础上下标测试
```
目标答案: x_i^2
用户输入: x^2_i
期望结果: ✅ 正确

目标答案: x_i^2  
用户输入: x_i^2
期望结果: ✅ 正确

目标答案: x^2_i
用户输入: x_i^2
期望结果: ✅ 正确
```

### 复杂上下标测试
```
目标答案: a_{i+1}^{2n}
用户输入: a^{2n}_{i+1}
期望结果: ✅ 正确

目标答案: \sum_{i=1}^n
用户输入: \sum^n_{i=1}
期望结果: ✅ 正确

目标答案: x_1^2 + x_2^2
用户输入: x^2_1 + x^2_2
期望结果: ✅ 正确
```

### 边界情况测试
```
目标答案: x^2
用户输入: x^2
期望结果: ✅ 正确（无下标）

目标答案: x_i
用户输入: x_i
期望结果: ✅ 正确（无上标）

目标答案: x_i^2_j
用户输入: x^2_i_j
期望结果: ✅ 正确（多重下标）
```

### 错误情况测试
```
目标答案: x_i^2
用户输入: y_i^2
期望结果: ❌ 错误（变量名不同）

目标答案: x_i^2
用户输入: x_j^2
期望结果: ❌ 错误（下标不同）

目标答案: x_i^2
用户输入: x_i^3
期望结果: ❌ 错误（上标不同）
```

## 手动测试步骤

1. 启动应用
2. 进入"基础语法"课程第3题
3. 输入 `$x^2_i$`
4. 验证显示为正确
5. 输入 `$x_i^2$`
6. 验证显示为正确

## 自动化测试

### 后端测试
```python
def test_subscript_superscript_order():
    from app.routes.practice import check_latex_answer
    
    # 测试基础情况
    assert check_latex_answer("x^2_i", "x_i^2") == True
    assert check_latex_answer("x_i^2", "x^2_i") == True
    
    # 测试复杂情况
    assert check_latex_answer("a^{2n}_{i+1}", "a_{i+1}^{2n}") == True
    assert check_latex_answer("\\sum^n_{i=1}", "\\sum_{i=1}^n") == True
    
    # 测试错误情况
    assert check_latex_answer("x^2_i", "y_i^2") == False
    assert check_latex_answer("x_i^2", "x_j^2") == False
```

### 前端测试
```javascript
import { checkAnswerEquivalence } from '../utils/answerValidation.js';

describe('上下标顺序测试', () => {
  test('基础上下标顺序', () => {
    expect(checkAnswerEquivalence('x^2_i', 'x_i^2')).toBe(true);
    expect(checkAnswerEquivalence('x_i^2', 'x^2_i')).toBe(true);
  });
  
  test('复杂上下标顺序', () => {
    expect(checkAnswerEquivalence('a^{2n}_{i+1}', 'a_{i+1}^{2n}')).toBe(true);
    expect(checkAnswerEquivalence('\\sum^n_{i=1}', '\\sum_{i=1}^n')).toBe(true);
  });
  
  test('错误情况', () => {
    expect(checkAnswerEquivalence('x^2_i', 'y_i^2')).toBe(false);
    expect(checkAnswerEquivalence('x_i^2', 'x_j^2')).toBe(false);
  });
});
```

## 验证清单

- [ ] 后端 `normalize_latex` 函数已更新
- [ ] 前端 `checkAnswerEquivalence` 函数已更新  
- [ ] 工具函数 `answerValidation.js` 已更新
- [ ] 基础测试用例通过
- [ ] 复杂测试用例通过
- [ ] 边界情况测试通过
- [ ] 错误情况正确识别
- [ ] 原有功能未受影响
