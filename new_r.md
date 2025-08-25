对于有些命令\neq，\geq，去掉q的版本latex也是等价的（比方说\ne，\ge）感觉更习惯些。

<和>与\lt和\gt的等价关系。

对于括号的等价关系处理也可以更灵活些，比方说\left ( \right )。

$...$与\(...\)的等价关系，$$...$$与\begin{equation}...\end{equation}的等价关系。

可以参考math_dapo中的一些实现，不过作为学习目的，上述那几个就足够啦。

# Constants for normalization
SUBSTITUTIONS = [
    ("an ", ""),
    ("a ", ""),
    (".$", "$"),
    ("\\$", ""),
    (r"\ ", ""),
    (" ", ""),
    ("mbox", "text"),
    (",\\text{and}", ","),
    ("\\text{and}", ","),
    ("\\text{m}", "\\text{}"),
]
p.s. 可以添加的一些常用函数，比方说\min，\max，\arg\min⚡

