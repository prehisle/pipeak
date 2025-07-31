# 智能反馈系统设计方案

## 功能概述

基于用户反馈，实现两个核心功能：
1. **"正确但不规范"警告机制** - 识别数学上正确但不符合LaTeX最佳实践的答案
2. **LaTeX最佳实践提示功能** - 在适当时机提供学习建议和规范指导

## 技术架构设计

### 1. 验证结果分级系统

```javascript
const ValidationResult = {
  PERFECT: 'perfect',                    // 完全正确且规范
  CORRECT_NON_STANDARD: 'correct_but_non_standard',  // 正确但不规范  
  INCORRECT: 'incorrect'                 // 错误
}

const ValidationResponse = {
  result: ValidationResult,
  isCorrect: boolean,
  suggestions: Array<Suggestion>,
  bestPractice: BestPractice | null
}
```

### 2. 规范性检查器

```javascript
const StandardnessChecker = {
  // 上下标顺序检查
  checkSubscriptSuperscriptOrder: (latex) => ({
    isStandard: boolean,
    suggestion: "建议先写下标再写上标：x_i^2 而不是 x^2_i",
    correctedVersion: string
  }),
  
  // 函数名检查
  checkFunctionNames: (latex) => ({
    isStandard: boolean,
    suggestion: "数学函数应使用反斜杠：\\sin 而不是 sin",
    correctedVersion: string
  }),
  
  // 大型运算符检查
  checkLargeOperators: (latex) => ({
    isStandard: boolean,
    suggestion: "求和符号建议先写下标再写上标：\\sum_{i=1}^n",
    correctedVersion: string
  })
}
```

### 3. 提示内容系统

```javascript
const TipCategories = {
  SUBSCRIPT_SUPERSCRIPT: 'subscript_superscript',
  FUNCTION_NAMES: 'function_names',
  LARGE_OPERATORS: 'large_operators',
  BRACKETS: 'brackets',
  SPACING: 'spacing',
  BEST_PRACTICES: 'best_practices'
}

const TipContent = {
  id: string,
  category: TipCategories,
  title: string,
  content: string,
  example: {
    wrong: string,
    correct: string,
    explanation: string
  },
  level: 'beginner' | 'intermediate' | 'advanced',
  i18n: {
    zh: {...},
    en: {...}
  }
}
```

## 用户体验设计

### 1. 反馈显示层级

#### 完全正确 (Perfect)
```
✅ 完全正确！
```

#### 正确但不规范 (Correct but Non-standard)
```
✅ 答案正确！ ⚠️ 建议改进
💡 建议：使用 x_i^2 而不是 x^2_i（先下标后上标）
```

#### 错误 (Incorrect)
```
❌ 答案不正确
💡 提示：检查上下标的写法
```

### 2. 提示展示方式

#### 即时建议 (Inline Suggestions)
- 在答案反馈区域直接显示
- 不打断用户流程
- 可点击查看详细说明

#### 最佳实践卡片 (Best Practice Cards)
- 练习完成后显示
- 课程完成时的综合建议
- 可收藏和回顾

#### 今日小贴士 (Daily Tips)
- 登录时显示
- 随机或基于学习进度
- 可关闭和跳过

### 3. 用户控制选项

```javascript
const UserPreferences = {
  showStandardnessSuggestions: boolean,    // 显示规范性建议
  showBestPracticeTips: boolean,          // 显示最佳实践提示
  tipFrequency: 'high' | 'medium' | 'low', // 提示频率
  preferredTipCategories: Array<TipCategories>, // 偏好的提示类型
  showDailyTips: boolean                   // 显示每日小贴士
}
```

## 实现计划

### 阶段1：核心验证系统升级 (1-2天)

1. **后端改进**
   - 修改 `check_latex_answer` 函数返回详细结果
   - 实现规范性检查器
   - 创建提示内容配置

2. **前端适配**
   - 修改 PracticeCard 组件支持新的反馈格式
   - 创建建议显示组件

### 阶段2：提示内容系统 (2-3天)

1. **内容准备**
   - 编写LaTeX最佳实践内容
   - 创建示例和说明
   - 多语言支持

2. **展示组件**
   - 最佳实践卡片组件
   - 提示弹窗组件
   - 设置面板

### 阶段3：智能推荐 (3-4天)

1. **个性化推荐**
   - 基于用户错误模式的建议
   - 学习进度相关提示
   - 智能提示时机

2. **用户偏好**
   - 设置界面
   - 提示频率控制
   - 个性化配置

### 阶段4：优化完善 (1-2天)

1. **性能优化**
   - 提示内容缓存
   - 异步加载
   - 用户体验优化

2. **测试验证**
   - 功能测试
   - 用户体验测试
   - 性能测试

## 具体实现示例

### 1. 增强的验证函数

```python
def enhanced_check_latex_answer(user_answer, target_answer):
    """增强的LaTeX答案检查，支持规范性建议"""
    
    # 基础正确性检查
    is_mathematically_correct = check_mathematical_equivalence(user_answer, target_answer)
    
    if not is_mathematically_correct:
        return {
            'result': 'incorrect',
            'isCorrect': False,
            'suggestions': generate_error_hints(user_answer, target_answer),
            'bestPractice': None
        }
    
    # 规范性检查
    standardness_issues = check_standardness(user_answer, target_answer)
    
    if standardness_issues:
        return {
            'result': 'correct_but_non_standard',
            'isCorrect': True,
            'suggestions': standardness_issues,
            'bestPractice': get_related_best_practice(standardness_issues)
        }
    
    return {
        'result': 'perfect',
        'isCorrect': True,
        'suggestions': [],
        'bestPractice': get_random_tip_for_level(user_level)
    }
```

### 2. 前端反馈组件

```jsx
const EnhancedFeedback = ({ validationResult }) => {
  const { result, isCorrect, suggestions, bestPractice } = validationResult;
  
  return (
    <div className="feedback-container">
      {/* 主要反馈 */}
      <div className={`main-feedback ${result}`}>
        {result === 'perfect' && (
          <div className="perfect-feedback">
            <CheckIcon className="text-green-500" />
            <span>完全正确！</span>
          </div>
        )}
        
        {result === 'correct_but_non_standard' && (
          <div className="non-standard-feedback">
            <CheckIcon className="text-green-500" />
            <span>答案正确！</span>
            <WarningIcon className="text-yellow-500" />
            <span className="text-yellow-600">建议改进</span>
          </div>
        )}
        
        {result === 'incorrect' && (
          <div className="incorrect-feedback">
            <XIcon className="text-red-500" />
            <span>答案不正确</span>
          </div>
        )}
      </div>
      
      {/* 建议区域 */}
      {suggestions.length > 0 && (
        <SuggestionsList suggestions={suggestions} />
      )}
      
      {/* 最佳实践提示 */}
      {bestPractice && (
        <BestPracticeCard tip={bestPractice} />
      )}
    </div>
  );
};
```

## 配置化内容

### 提示内容示例

```json
{
  "tips": [
    {
      "id": "subscript_superscript_order",
      "category": "subscript_superscript",
      "title": "上下标书写顺序",
      "content": "在LaTeX中，建议先写下标再写上标，这样更符合数学排版的传统习惯。",
      "example": {
        "wrong": "x^2_i",
        "correct": "x_i^2",
        "explanation": "虽然两种写法在数学上等价，但 x_i^2 是更标准的写法"
      },
      "level": "beginner",
      "triggers": ["subscript_superscript_order_issue"]
    },
    {
      "id": "function_names",
      "category": "function_names", 
      "title": "数学函数名",
      "content": "数学函数名应该使用反斜杠开头，这样可以确保正确的字体和间距。",
      "example": {
        "wrong": "sin(x) + cos(x)",
        "correct": "\\sin(x) + \\cos(x)",
        "explanation": "使用 \\sin 和 \\cos 可以得到正确的数学字体"
      },
      "level": "beginner",
      "triggers": ["function_name_issue"]
    }
  ]
}
```

这个设计方案提供了完整的智能反馈系统，既能帮助用户学习LaTeX最佳实践，又不会过度打扰用户的学习流程。
