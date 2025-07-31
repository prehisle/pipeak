# -*- coding: utf-8 -*-
"""
LaTeX规范性检查器
用于检查LaTeX代码是否符合最佳实践
"""

import re
from typing import List, Dict, Optional, Tuple


class StandardnessIssue:
    """规范性问题类"""
    def __init__(self, issue_type: str, message: str, suggestion: str, 
                 corrected_version: str = None, severity: str = 'info'):
        self.issue_type = issue_type
        self.message = message
        self.suggestion = suggestion
        self.corrected_version = corrected_version
        self.severity = severity  # 'info', 'warning', 'error'

    def to_dict(self):
        return {
            'type': self.issue_type,
            'message': self.message,
            'suggestion': self.suggestion,
            'corrected_version': self.corrected_version,
            'severity': self.severity
        }


class StandardnessChecker:
    """LaTeX规范性检查器"""
    
    def __init__(self):
        # 简化版：只保留真正有价值的检查
        self.checks = [
            self._check_function_names,    # 影响渲染效果
            self._check_bracket_usage      # 避免解析歧义
            # 移除争议性检查：
            # self._check_subscript_superscript_order,  # 争议性大
            # self._check_large_operators,              # 不是绝对标准
            # self._check_spacing_issues                # 过于细节
        ]
    
    def check_standardness(self, user_latex: str, target_latex: str = None) -> List[StandardnessIssue]:
        """
        检查LaTeX代码的规范性
        
        Args:
            user_latex: 用户输入的LaTeX代码
            target_latex: 目标LaTeX代码（可选，用于对比）
            
        Returns:
            规范性问题列表
        """
        issues = []
        
        # 标准化输入
        user_latex = self._normalize_input(user_latex)
        
        # 运行所有检查
        for check_func in self.checks:
            try:
                issue = check_func(user_latex, target_latex)
                if issue:
                    issues.append(issue)
            except Exception as e:
                print(f"规范性检查出错: {check_func.__name__}: {e}")
                continue
        
        return issues
    
    def _normalize_input(self, latex_str: str) -> str:
        """标准化输入字符串"""
        if not latex_str:
            return ""
        
        # 移除美元符号
        latex_str = re.sub(r'^\$+|\$+$', '', latex_str.strip())
        return latex_str
    
    def _check_subscript_superscript_order(self, latex_str: str, target: str = None) -> Optional[StandardnessIssue]:
        """检查上下标顺序"""
        # 查找同时有上标和下标的模式
        pattern = r'([a-zA-Z])(\^[^_\s]*)?(_[^_^\s]*)?'
        matches = re.finditer(pattern, latex_str)
        
        for match in matches:
            base, sup, sub = match.groups()
            if sup and sub:
                # 检查是否是 x^2_i 的形式（上标在前）
                if match.group(0).find(sup) < match.group(0).find(sub):
                    corrected = base + sub + sup
                    return StandardnessIssue(
                        issue_type='subscript_superscript_order',
                        message='上下标顺序建议调整',
                        suggestion=f'建议先写下标再写上标：{corrected} 而不是 {match.group(0)}',
                        corrected_version=latex_str.replace(match.group(0), corrected),
                        severity='info'
                    )
        
        return None
    
    def _check_function_names(self, latex_str: str, target: str = None) -> Optional[StandardnessIssue]:
        """检查数学函数名"""
        # 常见的数学函数
        functions = ['sin', 'cos', 'tan', 'cot', 'sec', 'csc',
                    'ln', 'log', 'exp', 'sqrt', 'lim', 'max', 'min']

        for func in functions:
            # 查找没有反斜杠的函数名，但要排除已经有反斜杠的情况
            pattern = rf'(?<!\\)\b{func}\b'
            if re.search(pattern, latex_str):
                corrected = re.sub(pattern, f'\\\\{func}', latex_str)
                return StandardnessIssue(
                    issue_type='function_names',
                    message='小贴士：函数名可以更美观',
                    suggestion=f'试试 \\{func}，渲染效果更好哦',
                    corrected_version=corrected,
                    severity='tip'
                )

        return None
    
    def _check_large_operators(self, latex_str: str, target: str = None) -> Optional[StandardnessIssue]:
        """检查大型运算符（求和、积分等）的上下标顺序"""
        # 检查求和符号
        sum_pattern = r'\\sum(\^[^_\s]*)?(_[^_^\s]*)?'
        match = re.search(sum_pattern, latex_str)
        
        if match:
            full_match = match.group(0)
            sup = match.group(1)  # 上标部分
            sub = match.group(2)  # 下标部分
            
            if sup and sub:
                # 检查上标是否在下标前面
                if full_match.find(sup) < full_match.find(sub):
                    corrected = f'\\sum{sub}{sup}'
                    return StandardnessIssue(
                        issue_type='large_operators',
                        message='求和符号上下标顺序建议调整',
                        suggestion=f'建议使用 {corrected} 而不是 {full_match}',
                        corrected_version=latex_str.replace(full_match, corrected),
                        severity='info'
                    )
        
        # 类似地检查积分符号
        int_pattern = r'\\int(\^[^_\s]*)?(_[^_^\s]*)?'
        match = re.search(int_pattern, latex_str)
        
        if match:
            full_match = match.group(0)
            sup = match.group(1)
            sub = match.group(2)
            
            if sup and sub and full_match.find(sup) < full_match.find(sub):
                corrected = f'\\int{sub}{sup}'
                return StandardnessIssue(
                    issue_type='large_operators',
                    message='积分符号上下标顺序建议调整',
                    suggestion=f'建议使用 {corrected} 而不是 {full_match}',
                    corrected_version=latex_str.replace(full_match, corrected),
                    severity='info'
                )
        
        return None
    
    def _check_bracket_usage(self, latex_str: str, target: str = None) -> Optional[StandardnessIssue]:
        """检查括号使用"""
        # 检查是否应该使用花括号的情况
        # 例如：x^10 应该写成 x^{10}
        pattern = r'(\^|_)([0-9]{2,}|[a-zA-Z]{2,})'
        match = re.search(pattern, latex_str)
        
        if match:
            operator = match.group(1)
            content = match.group(2)
            corrected = latex_str.replace(f'{operator}{content}', f'{operator}{{{content}}}')
            
            return StandardnessIssue(
                issue_type='bracket_usage',
                message='小贴士：花括号让表达更清晰',
                suggestion=f'试试 {operator}{{{content}}}，避免歧义哦',
                corrected_version=corrected,
                severity='tip'
            )
        
        return None
    
    def _check_spacing_issues(self, latex_str: str, target: str = None) -> Optional[StandardnessIssue]:
        """检查空格问题"""
        # 检查运算符周围的空格
        # 这个检查比较复杂，暂时简化处理
        
        # 检查是否有多余的空格
        if re.search(r'\s{2,}', latex_str):
            corrected = re.sub(r'\s+', ' ', latex_str).strip()
            return StandardnessIssue(
                issue_type='spacing',
                message='发现多余空格',
                suggestion='建议移除多余的空格',
                corrected_version=corrected,
                severity='info'
            )
        
        return None


def check_latex_standardness(user_latex: str, target_latex: str = None) -> List[Dict]:
    """
    便捷函数：检查LaTeX代码规范性
    
    Args:
        user_latex: 用户输入的LaTeX代码
        target_latex: 目标LaTeX代码（可选）
        
    Returns:
        规范性问题列表（字典格式）
    """
    checker = StandardnessChecker()
    issues = checker.check_standardness(user_latex, target_latex)
    return [issue.to_dict() for issue in issues]


# 测试函数
if __name__ == "__main__":
    # 测试用例
    test_cases = [
        "x^2_i",           # 上下标顺序问题
        "sin(x) + cos(x)", # 函数名问题
        "\\sum^n_{i=1}",   # 大型运算符顺序问题
        "x^10",            # 括号使用问题
        "a  +  b",         # 空格问题
    ]
    
    checker = StandardnessChecker()
    
    for test_case in test_cases:
        print(f"\n测试: {test_case}")
        issues = checker.check_standardness(test_case)
        if issues:
            for issue in issues:
                print(f"  问题: {issue.message}")
                print(f"  建议: {issue.suggestion}")
                if issue.corrected_version:
                    print(f"  修正: {issue.corrected_version}")
        else:
            print("  无规范性问题")
