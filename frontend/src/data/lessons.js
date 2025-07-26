// 课程数据 - 前端实现，支持国际化
export const lessonsData = {
  "en-US": [
    {
      id: "lesson-1",
      title: "Lesson 1: Math Environment & Basic Syntax",
      description: "Learn the basic syntax of LaTeX mathematical formulas, master the use of math environments, superscripts, and subscripts.",
      duration: 15,
      order: 1,
      knowledgePoints: [
        {
          id: "kp-1-1",
          title: "Math Environment",
          content: `# Math Environment

LaTeX provides various math environments for writing mathematical formulas:

## Inline Math
Use \`$...$\` for inline formulas:
- \`$x + y = z$\` displays as: $x + y = z$

## Display Math
Use \`$$...$$\` for display formulas:
- \`$$E = mc^2$$\` displays as: $$E = mc^2$$

## Numbered Equations
Use \`\\begin{equation}...\\end{equation}\` for numbered equations.`,
          exercises: [
            {
              question: "Please enter inline formula: x squared",
              target: "$x^2$",
              hints: ["Use superscript symbol ^", "Format: $x^2$"]
            },
            {
              question: "Please enter y cubed",
              target: "$y^3$",
              hints: ["Use superscript symbol ^", "Format: $y^3$"]
            },
            {
              question: "Please enter a to the power of n",
              target: "$a^n$",
              hints: ["Use superscript symbol ^", "Format: $a^n$"]
            },
            {
              question: "Please enter x subscript 1",
              target: "$x_1$",
              hints: ["Use subscript symbol _", "Format: $x_1$"]
            },
            {
              question: "Please enter x to the power of 2n+1",
              target: "$x^{2n+1}$",
              hints: ["Use braces {} for complex expressions", "Format: $x^{2n+1}$"]
            }
          ]
        }
      ]
    },
    {
      id: "lesson-2",
      title: "Lesson 2: Fractions & Radicals",
      description: "Learn how to write fractions and radical expressions in LaTeX.",
      duration: 20,
      order: 2,
      knowledgePoints: [
        {
          id: "kp-2-1",
          title: "Fractions",
          content: `# Fractions

## Basic Fractions
Use \`\\frac{numerator}{denominator}\`:
- \`\\frac{1}{2}\` displays as: $\\frac{1}{2}$
- \`\\frac{a}{b}\` displays as: $\\frac{a}{b}$

## Complex Fractions
- \`\\frac{x+1}{x-1}\` displays as: $\\frac{x+1}{x-1}$`,
          exercises: [
            {
              question: "Please enter one half",
              target: "$\\frac{1}{2}$",
              hints: ["Use \\frac{numerator}{denominator}", "Format: $\\frac{1}{2}$"]
            },
            {
              question: "Please enter two thirds",
              target: "$\\frac{2}{3}$",
              hints: ["Use \\frac{numerator}{denominator}", "Format: $\\frac{2}{3}$"]
            },
            {
              question: "Please enter square root of 2",
              target: "$\\sqrt{2}$",
              hints: ["Use \\sqrt{}", "Format: $\\sqrt{2}$"]
            },
            {
              question: "Please enter cube root of 8",
              target: "$\\sqrt[3]{8}$",
              hints: ["Use \\sqrt[n]{} for nth root", "Format: $\\sqrt[3]{8}$"]
            },
            {
              question: "Please enter complex fraction: (x-1)/(x+1)",
              target: "$\\frac{x-1}{x+1}$",
              hints: ["Use \\frac{numerator}{denominator}", "Format: $\\frac{x-1}{x+1}$"]
            }
          ]
        }
      ]
    }
  ],
  "zh-CN": [
    {
      id: "lesson-1",
      title: "第1课：数学环境与基础语法",
      description: "学习LaTeX数学公式的基础语法，掌握数学环境、上标、下标的使用方法。",
      duration: 15,
      order: 1,
      knowledgePoints: [
        {
          id: "kp-1-1",
          title: "数学环境",
          content: `# 数学环境

LaTeX 提供了多种数学环境来编写数学公式：

## 行内公式
使用 \`$...$\` 来编写行内公式：
- \`$x + y = z$\` 显示为：$x + y = z$

## 独立公式
使用 \`$$...$$\` 来编写独立公式：
- \`$$E = mc^2$$\` 显示为：$$E = mc^2$$

## 编号公式
使用 \`\\begin{equation}...\\end{equation}\` 来编写带编号的公式。`,
          exercises: [
            {
              question: "请输入行内公式：x 的平方",
              answer: "$x^2$",
              hint: "使用 $ 符号包围公式，上标用 ^ 表示"
            }
          ]
        },
        {
          id: "kp-1-2", 
          title: "上标与下标",
          content: `# 上标与下标

## 上标
使用 \`^\` 来表示上标：
- \`x^2\` 显示为：$x^2$
- \`x^{10}\` 显示为：$x^{10}$

## 下标
使用 \`_\` 来表示下标：
- \`x_1\` 显示为：$x_1$
- \`x_{max}\` 显示为：$x_{max}$

## 同时使用上标和下标
- \`x_1^2\` 显示为：$x_1^2$
- \`x^2_1\` 显示为：$x^2_1$`,
          exercises: [
            {
              question: "请输入：x 的 1 次方的下标 i",
              answer: "$x_i^1$",
              hint: "先写下标 _i，再写上标 ^1"
            }
          ]
        }
      ]
    },
    {
      id: "lesson-2",
      title: "第2课：分数与根号",
      description: "学习如何在LaTeX中表示分数和根号，掌握复杂数学表达式的写法。",
      duration: 15,
      order: 2,
      knowledgePoints: [
        {
          id: "kp-2-1",
          title: "分数",
          content: `# 分数

## 基本分数
使用 \`\\frac{分子}{分母}\` 来表示分数：
- \`\\frac{1}{2}\` 显示为：$\\frac{1}{2}$
- \`\\frac{x+1}{x-1}\` 显示为：$\\frac{x+1}{x-1}$

## 嵌套分数
分数可以嵌套使用：
- \`\\frac{1}{1+\\frac{1}{2}}\` 显示为：$\\frac{1}{1+\\frac{1}{2}}$`,
          exercises: [
            {
              question: "请输入分数：a 分之 b",
              answer: "$\\frac{b}{a}$",
              hint: "使用 \\frac{分子}{分母} 格式"
            }
          ]
        }
      ]
    }
  ],
  "en-US": [
    {
      id: "lesson-1",
      title: "Lesson 1: Math Environments & Basic Syntax",
      description: "Learn the basic syntax of LaTeX mathematical formulas, master the use of math environments, superscripts, and subscripts.",
      duration: 15,
      order: 1,
      knowledgePoints: [
        {
          id: "kp-1-1",
          title: "Math Environments",
          content: `# Math Environments

LaTeX provides various math environments for writing mathematical formulas:

## Inline Math
Use \`$...$\` for inline formulas:
- \`$x + y = z$\` displays as: $x + y = z$

## Display Math
Use \`$$...$$\` for display formulas:
- \`$$E = mc^2$$\` displays as: $$E = mc^2$$

## Numbered Equations
Use \`\\begin{equation}...\\end{equation}\` for numbered equations.`,
          exercises: [
            {
              question: "Please enter inline formula: x squared",
              answer: "$x^2$",
              hint: "Use $ symbols to wrap the formula, use ^ for superscript"
            }
          ]
        },
        {
          id: "kp-1-2",
          title: "Superscripts & Subscripts", 
          content: `# Superscripts & Subscripts

## Superscripts
Use \`^\` for superscripts:
- \`x^2\` displays as: $x^2$
- \`x^{10}\` displays as: $x^{10}$

## Subscripts
Use \`_\` for subscripts:
- \`x_1\` displays as: $x_1$
- \`x_{max}\` displays as: $x_{max}$

## Combined Super and Subscripts
- \`x_1^2\` displays as: $x_1^2$
- \`x^2_1\` displays as: $x^2_1$`,
          exercises: [
            {
              question: "Please enter: x to the power of 1 with subscript i",
              answer: "$x_i^1$",
              hint: "Write subscript _i first, then superscript ^1"
            }
          ]
        }
      ]
    },
    {
      id: "lesson-2", 
      title: "Lesson 2: Fractions & Radicals",
      description: "Learn how to represent fractions and radicals in LaTeX, master complex mathematical expressions.",
      duration: 15,
      order: 2,
      knowledgePoints: [
        {
          id: "kp-2-1",
          title: "Fractions",
          content: `# Fractions

## Basic Fractions
Use \`\\frac{numerator}{denominator}\` for fractions:
- \`\\frac{1}{2}\` displays as: $\\frac{1}{2}$
- \`\\frac{x+1}{x-1}\` displays as: $\\frac{x+1}{x-1}$

## Nested Fractions
Fractions can be nested:
- \`\\frac{1}{1+\\frac{1}{2}}\` displays as: $\\frac{1}{1+\\frac{1}{2}}$`,
          exercises: [
            {
              question: "Please enter fraction: b over a",
              answer: "$\\frac{b}{a}$",
              hint: "Use \\frac{numerator}{denominator} format"
            }
          ]
        }
      ]
    }
  ]
}

// 获取指定语言的课程数据
export const getLessons = (language = 'zh-CN') => {
  return lessonsData[language] || lessonsData['zh-CN']
}

// 根据ID获取特定课程
export const getLessonById = (id, language = 'zh-CN') => {
  const lessons = getLessons(language)
  return lessons.find(lesson => lesson.id === id)
}

// 获取课程总数
export const getLessonCount = (language = 'zh-CN') => {
  return getLessons(language).length
}
