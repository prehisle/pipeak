import ContentRenderer from '../components/ContentRenderer'
import MarkdownRenderer from '../components/MarkdownRenderer'

const RenderTestPage = () => {
  // 测试内容 - 与数据库中的实际内容相同
  const testContent = `**LaTeX数学环境**

LaTeX数学公式需要在特定环境中编写：

• **行内公式**：使用 \`$...$\` 包围，如 \`$x^2$\` → $x^2$
• **独立公式**：使用 \`$$...$$\` 包围，如 \`$$E = mc^2$$\` → $$E = mc^2$$`

  const testContent2 = `**上标和下标**

• 上标使用 \`^\` 符号：\`$x^2$\` → $x^2$
• 下标使用 \`_\` 符号：\`$x_1$\` → $x_1$
• 同时使用：\`$x_1^2$\` → $x_1^2$`

  const testContent3 = `**花括号的重要性**

多字符的上标下标必须用花括号包围：

• \`$x^{10}$\` → $x^{10}$ ✓ 正确
• \`$x^10$\` → $x^10$ ✗ 错误
• \`$x_{max}$\` → $x_{max}$ ✓ 正确
• \`$a^{n+1}$\` → $a^{n+1}$ ✓ 正确`

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          渲染组件测试页面
        </h1>
        <p className="text-gray-600">
          测试新的ContentRenderer组件是否正确渲染LaTeX和Markdown内容
        </p>
      </div>

      {/* 测试1 */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-xl font-semibold">测试1: LaTeX数学环境</h2>
        </div>
        <div className="card-body">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">💡</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">
                  知识点 1
                </h3>
                <div className="text-blue-800">
                  <MarkdownRenderer content={testContent} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 测试2 */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-xl font-semibold">测试2: 上标和下标</h2>
        </div>
        <div className="card-body">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">💡</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">
                  知识点 2
                </h3>
                <div className="text-blue-800">
                  <MarkdownRenderer content={testContent2} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 测试3 */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-xl font-semibold">测试3: 花括号的重要性</h2>
        </div>
        <div className="card-body">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">💡</span>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">
                  知识点 3
                </h3>
                <div className="text-blue-800">
                  <MarkdownRenderer content={testContent3} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 渲染方案对比 */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">渲染方案对比</h2>
          <p className="text-gray-600 mt-2">对比自定义渲染组件 vs 专业 Markdown 渲染组件</p>
        </div>
        <div className="card-body">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2 text-gray-700">原始 Markdown 文本</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto h-64">
{testContent}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-red-600">❌ 自定义渲染组件</h3>
              <div className="bg-white p-4 border rounded h-64 overflow-auto">
                <ContentRenderer content={testContent} />
              </div>
              <div className="mt-2 text-sm text-red-600">
                问题：需要手写解析逻辑，容易出错，样式单调
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-green-600">✅ Markdown 渲染组件</h3>
              <div className="bg-white p-4 border rounded h-64 overflow-auto">
                <MarkdownRenderer content={testContent} />
              </div>
              <div className="mt-2 text-sm text-green-600">
                优势：成熟稳定，样式美观，功能丰富
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 功能特性展示 */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Markdown 渲染组件特性展示</h2>
        </div>
        <div className="card-body">
          <div className="space-y-6">
            {/* 数学公式 */}
            <div>
              <h3 className="font-semibold mb-2">🧮 数学公式支持</h3>
              <div className="bg-white p-4 border rounded">
                <MarkdownRenderer content={`
行内公式：当 $a \\neq 0$ 时，方程 $ax^2 + bx + c = 0$ 的解为：

$$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$

复杂公式：$\\sum_{i=1}^{n} x_i^2 = x_1^2 + x_2^2 + \\cdots + x_n^2$
                `} />
              </div>
            </div>

            {/* 代码块 */}
            <div>
              <h3 className="font-semibold mb-2">💻 代码块支持</h3>
              <div className="bg-white p-4 border rounded">
                <MarkdownRenderer content={`
行内代码：使用 \`$x^2$\` 来表示平方

代码块：
\`\`\`latex
\\documentclass{article}
\\begin{document}
Hello LaTeX!
\\end{document}
\`\`\`
                `} />
              </div>
            </div>

            {/* 表格 */}
            <div>
              <h3 className="font-semibold mb-2">📊 表格支持</h3>
              <div className="bg-white p-4 border rounded">
                <MarkdownRenderer content={`
| 符号 | LaTeX 代码 | 效果 |
|------|------------|------|
| 上标 | \`x^2\` | $x^2$ |
| 下标 | \`x_1\` | $x_1$ |
| 分数 | \`\\frac{1}{2}\` | $\\frac{1}{2}$ |
                `} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RenderTestPage
