// Complete English course data - translated from comprehensive Chinese version
// Supporting internationalization for frontend course data

// Function to convert backend data to frontend format
function convertBackendToFrontendEN(backendLessons) {
  return backendLessons.map(lesson => {
    // Convert according to original card order, maintaining learning flow continuity
    const knowledgePoints = []
    let knowledgePointIndex = 1

    lesson.cards.forEach((card) => {
      if (card.type === 'knowledge') {
        // Knowledge card: convert to pure knowledge point (no exercises)
        knowledgePoints.push({
          id: `kp-${lesson.sequence}-${knowledgePointIndex}`,
          title: extractTitleFromContentEN(card.content),
          content: card.content,
          exercises: [] // Pure knowledge point, no exercises
        })
        knowledgePointIndex++
      } else if (card.type === 'practice') {
        // Practice card: convert to practice knowledge point (contains one exercise)
        knowledgePoints.push({
          id: `kp-${lesson.sequence}-${knowledgePointIndex}`,
          title: `Practice: ${card.question.replace('Please enter LaTeX code to represent: ', '').replace('Please enter LaTeX code to represent', '')}`,
          content: `## Practice Exercise\n\n${card.question}`, // Simple exercise description
          exercises: [{
            question: card.question,
            answer: card.target_formula,
            hint: card.hints?.[0] || 'No hint available',
            difficulty: card.difficulty || 'easy'
          }]
        })
        knowledgePointIndex++
      }
    })

    return {
      id: `lesson-${lesson.sequence}`,
      title: lesson.title,
      description: lesson.description,
      duration: 15, // Default 15 minutes
      order: lesson.sequence,
      knowledgePoints
    }
  })
}

// Helper function to extract title from content
function extractTitleFromContentEN(content) {
  const match = content.match(/\*\*(.*?)\*\*/)
  return match ? match[1] : 'Knowledge Point'
}

// Backend course data (translated from comprehensive_lessons.py)
const backendLessonsDataEN = [
  // Lesson 1: Math Environment & Basic Syntax
  {
    sequence: 1,
    title: 'Lesson 1: Math Environment & Basic Syntax',
    description: 'Learn the basic syntax of LaTeX mathematical formulas, master the use of math environments, superscripts, and subscripts.',
    cards: [
      {
        type: 'knowledge',
        content: '**LaTeX Math Environment**\n\nLaTeX mathematical formulas need to be written in specific environments:\n\n• **Inline formulas**: Use `$...$` to surround, e.g., `$x^2$` → $x^2$\n• **Display formulas**: Use `$$...$$` to surround, e.g., `$$E = mc^2$$` → $$E = mc^2$$'
      },
      {
        type: 'knowledge',
        content: '**Superscripts and Subscripts**\n\n• Superscripts use `^` symbol: `$x^2$` → $x^2$\n• Subscripts use `_` symbol: `$x_1$` → $x_1$\n• Use both: `$x_1^2$` → $x_1^2$'
      },
      {
        type: 'practice',
        question: 'Please enter LaTeX code to represent: x squared',
        target_formula: '$x^2$',
        hints: ['Use ^ symbol for superscript', 'Superscript content is 2', 'Complete format: $x^2$'],
        difficulty: 'easy'
      },
      {
        type: 'practice',
        question: 'Please enter LaTeX code to represent: a subscript 1',
        target_formula: '$a_1$',
        hints: ['Use _ symbol for subscript', 'Subscript content is 1', 'Complete format: $a_1$'],
        difficulty: 'easy'
      },
      {
        type: 'practice',
        question: 'Please enter LaTeX code to represent: x subscript n squared',
        target_formula: '$x_n^2$',
        hints: ['First write subscript _n, then superscript ^2', 'Or write as x_{n}^{2}', 'Complete format: $x_n^2$'],
        difficulty: 'medium'
      }
    ]
  },

  // Lesson 2: Fractions and Radicals
  {
    sequence: 2,
    title: 'Lesson 2: Fractions and Radicals',
    description: 'Learn how to represent fractions and radicals in LaTeX, master the writing of complex mathematical expressions.',
    cards: [
      {
        type: 'knowledge',
        content: '**Fraction Notation**\n\nUse `\\frac{numerator}{denominator}` command:\n\n• `$\\frac{1}{2}$` → $\\frac{1}{2}$\n• `$\\frac{a+b}{c-d}$` → $\\frac{a+b}{c-d}$\n• `$\\frac{x^2}{y^3}$` → $\\frac{x^2}{y^3}$'
      },
      {
        type: 'knowledge',
        content: '**Radical Notation**\n\nUse `\\sqrt{}` command:\n\n• `$\\sqrt{x}$` → $\\sqrt{x}$ (square root)\n• `$\\sqrt[3]{x}$` → $\\sqrt[3]{x}$ (cube root)\n• `$\\sqrt{x^2 + y^2}$` → $\\sqrt{x^2 + y^2}$'
      },
      {
        type: 'practice',
        question: 'Please enter LaTeX code to represent fraction: one half',
        target_formula: '$\\frac{1}{2}$',
        hints: ['Use \\frac{numerator}{denominator} command', 'Numerator is 1, denominator is 2', 'Complete format: $\\frac{1}{2}$'],
        difficulty: 'easy'
      },
      {
        type: 'practice',
        question: 'Please enter LaTeX code to represent: square root of 2',
        target_formula: '$\\sqrt{2}$',
        hints: ['Use \\sqrt{} command for square root', 'Content inside root is 2', 'Complete format: $\\sqrt{2}$'],
        difficulty: 'easy'
      },
      {
        type: 'practice',
        question: 'Please enter LaTeX code to represent: x plus y squared, divided by 2',
        target_formula: '$\\frac{(x+y)^2}{2}$',
        hints: ['Numerator is (x+y)^2, denominator is 2', 'Note the use of parentheses', 'Complete format: $\\frac{(x+y)^2}{2}$'],
        difficulty: 'medium'
      },
      {
        type: 'practice',
        question: 'Please enter LaTeX code to represent: cube root of 8',
        target_formula: '$\\sqrt[3]{8}$',
        hints: ['Use \\sqrt[n]{} for nth root', 'Cube root is \\sqrt[3]{}', 'Complete format: $\\sqrt[3]{8}$'],
        difficulty: 'medium'
      }
    ]
  },

  // Lesson 3: Greek Letters and Common Symbols
  {
    sequence: 3,
    title: 'Lesson 3: Greek Letters and Common Symbols',
    description: 'Learn the LaTeX notation for common Greek letters and mathematical symbols, laying the foundation for advanced mathematical formulas.',
    cards: [
      {
        type: 'knowledge',
        content: '**Common Lowercase Greek Letters**\n\n• `$\\alpha$` → $\\alpha$ (alpha)\n• `$\\beta$` → $\\beta$ (beta)\n• `$\\gamma$` → $\\gamma$ (gamma)\n• `$\\delta$` → $\\delta$ (delta)\n• `$\\pi$` → $\\pi$ (pi)\n• `$\\theta$` → $\\theta$ (theta)\n• `$\\lambda$` → $\\lambda$ (lambda)\n• `$\\mu$` → $\\mu$ (mu)'
      },
      {
        type: 'knowledge',
        content: '**Common Uppercase Greek Letters**\n\n• `$\\Alpha$` → $\\Alpha$ (Alpha)\n• `$\\Beta$` → $\\Beta$ (Beta)\n• `$\\Gamma$` → $\\Gamma$ (Gamma)\n• `$\\Delta$` → $\\Delta$ (Delta)\n• `$\\Pi$` → $\\Pi$ (Pi)\n• `$\\Theta$` → $\\Theta$ (Theta)\n• `$\\Lambda$` → $\\Lambda$ (Lambda)\n• `$\\Sigma$` → $\\Sigma$ (Sigma)'
      },
      {
        type: 'practice',
        question: 'Please enter LaTeX code to represent: pi',
        target_formula: '$\\pi$',
        hints: ['Use \\pi command', 'Complete format: $\\pi$'],
        difficulty: 'easy'
      },
      {
        type: 'practice',
        question: 'Please enter LaTeX code to represent: alpha squared',
        target_formula: '$\\alpha^2$',
        hints: ['Use \\alpha for alpha', 'Add superscript ^2', 'Complete format: $\\alpha^2$'],
        difficulty: 'easy'
      }
    ]
  },

  // Lesson 4: Functions and Trigonometric Functions
  {
    sequence: 4,
    title: 'Lesson 4: Functions and Trigonometric Functions',
    description: 'Learn the LaTeX notation for function representation, trigonometric functions, logarithmic functions, and other common mathematical functions.',
    cards: [
      {
        type: 'knowledge',
        content: '**Basic Functions**\n\n• `$\\sin x$` → $\\sin x$ (sine)\n• `$\\cos x$` → $\\cos x$ (cosine)\n• `$\\tan x$` → $\\tan x$ (tangent)\n• `$\\log x$` → $\\log x$ (logarithm)\n• `$\\ln x$` → $\\ln x$ (natural logarithm)\n• `$\\exp x$` → $\\exp x$ (exponential)'
      },
      {
        type: 'practice',
        question: 'Please enter LaTeX code to represent: sine of x',
        target_formula: '$\\sin x$',
        hints: ['Use \\sin command', 'Complete format: $\\sin x$'],
        difficulty: 'easy'
      },
      {
        type: 'practice',
        question: 'Please enter LaTeX code to represent: natural logarithm of x plus 1',
        target_formula: '$\\ln(x+1)$',
        hints: ['Use \\ln command', 'Add parentheses for x+1', 'Complete format: $\\ln(x+1)$'],
        difficulty: 'medium'
      }
    ]
  },

  // Lesson 5: Summation, Integration, and Limits
  {
    sequence: 5,
    title: 'Lesson 5: Summation, Integration, and Limits',
    description: 'Learn the LaTeX representation of summation symbols, integral symbols, limit symbols, and other advanced mathematical notations.',
    cards: [
      {
        type: 'knowledge',
        content: '**Summation and Products**\n\n• `$\\sum_{i=1}^{n}$` → $\\sum_{i=1}^{n}$ (summation)\n• `$\\prod_{i=1}^{n}$` → $\\prod_{i=1}^{n}$ (product)\n• `$\\sum_{i=1}^{\\infty}$` → $\\sum_{i=1}^{\\infty}$ (infinite sum)'
      },
      {
        type: 'knowledge',
        content: '**Integration and Limits**\n\n• `$\\int f(x) dx$` → $\\int f(x) dx$ (indefinite integral)\n• `$\\int_a^b f(x) dx$` → $\\int_a^b f(x) dx$ (definite integral)\n• `$\\lim_{x \\to 0}$` → $\\lim_{x \\to 0}$ (limit)\n• `$\\lim_{n \\to \\infty}$` → $\\lim_{n \\to \\infty}$ (limit to infinity)'
      },
      {
        type: 'practice',
        question: 'Please enter LaTeX code to represent: sum from i equals 1 to n',
        target_formula: '$\\sum_{i=1}^{n}$',
        hints: ['Use \\sum command', 'Lower bound is _{i=1}', 'Upper bound is ^{n}', 'Complete format: $\\sum_{i=1}^{n}$'],
        difficulty: 'medium'
      },
      {
        type: 'practice',
        question: 'Please enter LaTeX code to represent: integral from 0 to 1 of x dx',
        target_formula: '$\\int_0^1 x dx$',
        hints: ['Use \\int command', 'Lower bound is _0', 'Upper bound is ^1', 'Complete format: $\\int_0^1 x dx$'],
        difficulty: 'medium'
      }
    ]
  },

  // Lesson 6: Matrices and Vectors
  {
    sequence: 6,
    title: 'Lesson 6: Matrices and Vectors',
    description: 'Learn the LaTeX representation of matrices, vectors, determinants, and other linear algebra symbols.',
    cards: [
      {
        type: 'knowledge',
        content: '**Matrix Notation**\n\n• `$\\begin{matrix} a & b \\\\ c & d \\end{matrix}$` → Basic matrix\n• `$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$` → Matrix with parentheses\n• `$\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$` → Matrix with brackets\n• `$\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}$` → Determinant'
      },
      {
        type: 'practice',
        question: 'Please enter LaTeX code to represent: 2x2 matrix with parentheses, elements a,b,c,d',
        target_formula: '$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$',
        hints: ['Use \\begin{pmatrix}...\\end{pmatrix}', 'Use & to separate columns', 'Use \\\\\\\\ to separate rows'],
        difficulty: 'medium'
      }
    ]
  },

  // Lesson 7: Equation Systems and Inequalities
  {
    sequence: 7,
    title: 'Lesson 7: Equation Systems and Inequalities',
    description: 'Learn the LaTeX representation of equation systems, inequality systems, conditional expressions, and other complex mathematical structures.',
    cards: [
      {
        type: 'knowledge',
        content: '**Inequality Symbols**\n\n• `$<$` → $<$ (less than)\n• `$>$` → $>$ (greater than)\n• `$\\leq$` → $\\leq$ (less than or equal)\n• `$\\geq$` → $\\geq$ (greater than or equal)\n• `$\\neq$` → $\\neq$ (not equal)\n• `$\\approx$` → $\\approx$ (approximately equal)'
      },
      {
        type: 'practice',
        question: 'Please enter LaTeX code to represent: x is greater than or equal to 0',
        target_formula: '$x \\geq 0$',
        hints: ['Use \\geq for greater than or equal', 'Complete format: $x \\geq 0$'],
        difficulty: 'easy'
      }
    ]
  },

  // Lesson 8: Set Theory and Logic Symbols
  {
    sequence: 8,
    title: 'Lesson 8: Set Theory and Logic Symbols',
    description: 'Learn the LaTeX representation of set theory symbols, logical operators, quantifiers, and other mathematical logic notations.',
    cards: [
      {
        type: 'knowledge',
        content: '**Set Theory Symbols**\n\n• `$\\in$` → $\\in$ (element of)\n• `$\\notin$` → $\\notin$ (not element of)\n• `$\\subset$` → $\\subset$ (subset)\n• `$\\supset$` → $\\supset$ (superset)\n• `$\\cup$` → $\\cup$ (union)\n• `$\\cap$` → $\\cap$ (intersection)\n• `$\\emptyset$` → $\\emptyset$ (empty set)'
      },
      {
        type: 'practice',
        question: 'Please enter LaTeX code to represent: x is an element of set A',
        target_formula: '$x \\in A$',
        hints: ['Use \\in for element of', 'Complete format: $x \\in A$'],
        difficulty: 'easy'
      }
    ]
  },

  // Lesson 9: Number Theory and Special Operations
  {
    sequence: 9,
    title: 'Lesson 9: Number Theory and Special Operations',
    description: 'Learn the LaTeX representation of number theory symbols, congruence, Knuth arrows, hyperoperations, and other advanced mathematical operations.',
    cards: [
      {
        type: 'knowledge',
        content: '**Number Theory Symbols**\n\n• `$\\gcd(a,b)$` → $\\gcd(a,b)$ (greatest common divisor)\n• `$\\lcm(a,b)$` → $\\lcm(a,b)$ (least common multiple)\n• `$a \\equiv b \\pmod{n}$` → $a \\equiv b \\pmod{n}$ (congruence)\n• `$a \\mid b$` → $a \\mid b$ (divides)\n• `$a \\nmid b$` → $a \\nmid b$ (does not divide)'
      },
      {
        type: 'knowledge',
        content: '**Knuth Arrows and Hyperoperations**\n\n• `$a \\uparrow b = a^b$` → $a \\uparrow b = a^b$ (exponentiation, level 3 operation)\n• `$a \\uparrow\\uparrow b$` → $a \\uparrow\\uparrow b$ (tetration, level 4 operation)\n• `$a \\uparrow\\uparrow\\uparrow b$` → $a \\uparrow\\uparrow\\uparrow b$ (level 5 operation)\n• `${}^n a$` → ${}^n a$ (hyperpower)\n• `$a^{(n)} b$` → $a^{(n)} b$ (n-level operation)\n• `$\\text{Ack}(m,n)$` → $\\text{Ack}(m,n)$ (Ackermann function)'
      },
      {
        type: 'practice',
        question: 'Please enter LaTeX code to represent: a is congruent to b modulo n',
        target_formula: '$a \\equiv b \\pmod{n}$',
        hints: ['Use \\equiv for congruence', 'Use \\pmod{n} for modulo', 'Complete format: $a \\equiv b \\pmod{n}$'],
        difficulty: 'medium'
      }
    ]
  },

  // Lesson 10: Advanced Analysis and Topology
  {
    sequence: 10,
    title: 'Lesson 10: Advanced Analysis and Topology',
    description: 'Learn professional LaTeX symbols for advanced mathematical analysis, topology, functional analysis, and other fields.',
    cards: [
      {
        type: 'knowledge',
        content: '**Advanced Analysis Symbols**\n\n• `$\\partial$` → $\\partial$ (partial derivative)\n• `$\\nabla$` → $\\nabla$ (nabla, gradient)\n• `$\\infty$` → $\\infty$ (infinity)\n• `$\\aleph$` → $\\aleph$ (aleph)\n• `$\\Re$` → $\\Re$ (real part)\n• `$\\Im$` → $\\Im$ (imaginary part)'
      },
      {
        type: 'knowledge',
        content: '**Topology and Advanced Symbols**\n\n• `$\\mathbb{R}$` → $\\mathbb{R}$ (real numbers)\n• `$\\mathbb{C}$` → $\\mathbb{C}$ (complex numbers)\n• `$\\mathbb{N}$` → $\\mathbb{N}$ (natural numbers)\n• `$\\mathbb{Z}$` → $\\mathbb{Z}$ (integers)\n• `$\\mathbb{Q}$` → $\\mathbb{Q}$ (rational numbers)\n• `$\\mathcal{F}$` → $\\mathcal{F}$ (script F, often for families or filters)'
      },
      {
        type: 'practice',
        question: 'Please enter LaTeX code to represent: partial derivative of f with respect to x',
        target_formula: '$\\frac{\\partial f}{\\partial x}$',
        hints: ['Use \\partial for partial derivative', 'Use \\frac for fraction', 'Complete format: $\\frac{\\partial f}{\\partial x}$'],
        difficulty: 'hard'
      },
      {
        type: 'practice',
        question: 'Please enter LaTeX code to represent: real numbers set',
        target_formula: '$\\mathbb{R}$',
        hints: ['Use \\mathbb{R} for real numbers', 'Complete format: $\\mathbb{R}$'],
        difficulty: 'medium'
      }
    ]
  }
]

// Convert backend data to frontend format and export
export const lessonsDataEN = convertBackendToFrontendEN(backendLessonsDataEN)
