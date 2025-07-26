// 英文课程数据
export const lessonsDataEN = [
  {
    id: "lesson-1",
    title: "Math Environment & Basic Syntax",
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
            question: "Please enter x squared",
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
    title: "Fractions & Radicals",
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
  },
  {
    id: "lesson-3",
    title: "Summation & Integration Symbols",
    description: "Learn how to write summation and integration symbols in LaTeX.",
    duration: 25,
    order: 3,
    knowledgePoints: [
      {
        id: "kp-3-1",
        title: "Summation",
        content: `# Summation Symbols

## Basic Summation
Use \`\\sum\` for summation:
- \`\\sum\` displays as: $\\sum$
- \`\\sum_{i=1}^{n}\` displays as: $\\sum_{i=1}^{n}$`,
        exercises: [
          {
            question: "Please enter summation symbol",
            target: "$\\sum$",
            hints: ["Use \\sum", "Format: $\\sum$"]
          },
          {
            question: "Please enter summation from 1 to n",
            target: "$\\sum_{i=1}^{n}$",
            hints: ["Use \\sum_{lower}^{upper}", "Format: $\\sum_{i=1}^{n}$"]
          }
        ]
      }
    ]
  }
]
