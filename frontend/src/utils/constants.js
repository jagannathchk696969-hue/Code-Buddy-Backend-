export const SUPPORTED_LANGUAGES = [
  { id: 'python', name: 'Python', monacoLang: 'python', extension: '.py', starter: `# Python 3 Starter Code\ndef calculate_sum(numbers):\n    total = 0\n    for num in numbers:\n        total += num\n    return total\n\n# Example usage\nresult = calculate_sum([10, 20, 30])\nprint("Sum is:", result)` },
  { id: 'c', name: 'C', monacoLang: 'c', extension: '.c', starter: `// C Starter Code\n#include <stdio.h>\n\nint main() {\n    int a = 10, b = 20;\n    int sum = a + b;\n    printf("Sum of %d and %d is %d\\n", a, b, sum);\n    return 0;\n}` },
  { id: 'cpp', name: 'C++', monacoLang: 'cpp', extension: '.cpp', starter: `// C++ Starter Code\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> nums = {5, 10, 15};\n    int sum = 0;\n    for (int n : nums) {\n        sum += n;\n    }\n    cout << "Sum: " << sum << endl;\n    return 0;\n}` },
  { id: 'javascript', name: 'JavaScript', monacoLang: 'javascript', extension: '.js', starter: `// JavaScript Starter Code\nfunction calculateAverage(numbers) {\n    if (numbers.length === 0) return 0;\n    const sum = numbers.reduce((acc, curr) => acc + curr, 0);\n    return sum / numbers.length;\n}\n\nconst scores = [85, 92, 78, 90];\nconsole.log("Average score:", calculateAverage(scores));` }
];

export const PRACTICE_TOPICS = [
  'Variables and data types',
  'Operators',
  'Conditional statements',
  'Loops',
  'Arrays',
  'Strings',
  'Functions',
  'Recursion',
  'Searching and sorting',
  'Object-oriented programming',
  'Basic data structures'
];

export const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const HINT_LEVELS = [
  { level: 1, title: 'Level 1: Conceptual Hint', desc: 'Explains the core idea without revealing the algorithm.' },
  { level: 2, title: 'Level 2: Approach Hint', desc: 'Outlines the logical steps to consider.' },
  { level: 3, title: 'Level 3: Pseudocode', desc: 'Provides structured algorithmic pseudocode.' },
  { level: 4, title: 'Level 4: Partial Code', desc: 'Shows a targeted syntax snippet in your selected language.' },
  { level: 5, title: 'Level 5: Full Solution', desc: 'Reveals the full reference code with step-by-step breakdown.' }
];
