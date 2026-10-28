# CodeBuddy AI — REST API Documentation

All API endpoints are prefixed with `/api` and return standard JSON payloads:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human readable status message"
}
```

Error responses follow a uniform contract:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Specific explanation of the failure",
    "details": [ ... ]
  }
}
```

---

## 1. Health & Diagnostics

### `GET /api/health`
Checks overall server status.
- **Auth**: None
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "status": "healthy",
      "timestamp": "2026-10-28T06:15:00.000Z",
      "uptime": 124.5
    }
  }
  ```

### `GET /api/health/ai`
Checks active AI provider health and connectivity.
- **Auth**: None
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "provider": "ollama",
      "model": "gemma3:1b",
      "status": "connected",
      "latencyMs": 42
    }
  }
  ```

---

## 2. Authentication & Profile

### `GET /api/auth/me`
Retrieves authenticated user session information.
- **Auth**: Bearer Token required
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "e9c70bf8-2394-4d69-a1d2-094e4f62bf9c",
      "email": "student@college.edu",
      "displayName": "Alex Chen",
      "createdAt": "2026-10-25T14:20:10Z"
    }
  }
  ```

### `GET /api/profile`
Fetches user profile details.
- **Auth**: Bearer Token required

### `PATCH /api/profile`
Updates user display name or preferences.
- **Auth**: Bearer Token required
- **Body**:
  ```json
  {
    "displayName": "Alex C."
  }
  ```

---

## 3. AI Capabilities

### `POST /api/ai/explain`
Generates a structured, beginner-friendly explanation of student code.
- **Auth**: Optional / Authenticated for saving activity
- **Body**:
  ```json
  {
    "language": "python",
    "code": "def fibonacci(n):\n    if n <= 1: return n\n    return fibonacci(n-1) + fibonacci(n-2)"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "summary": "This is a recursive function calculating the nth Fibonacci number.",
      "concepts": ["Recursion", "Base cases", "Function calls"],
      "lineByLine": [
        { "line": 1, "explanation": "Defines function `fibonacci` accepting integer parameter `n`." },
        { "line": 2, "explanation": "Base condition: if `n` is 0 or 1, return `n` directly to stop recursion." },
        { "line": 3, "explanation": "Recursive step: calls itself with `n-1` and `n-2` and sums the outputs." }
      ],
      "keyStatements": ["Base case check `n <= 1`", "Recursive calls `fibonacci(...)`"],
      "relatedExample": {
        "title": "Iterative Fibonacci",
        "code": "def fib_iter(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a",
        "explanation": "An iterative approach avoids deep recursive call stacks."
      }
    }
  }
  ```

### `POST /api/ai/debug`
Identifies bugs, syntax errors, or logical issues and suggests a minimal fix.
- **Body**:
  ```json
  {
    "language": "cpp",
    "code": "#include <iostream>\nusing namespace std;\nint main() {\n  int arr[5];\n  for(int i=0; i<=5; i++) cout << arr[i];\n}",
    "errorMessage": "Segmentation fault or garbage output at index 5",
    "expectedBehavior": "Print elements from index 0 to 4"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "problemDescription": "Array index out of bounds in loop condition.",
      "probableCause": "The loop condition `i <= 5` attempts to access `arr[5]`, but indices in an array of size 5 run from 0 to 4.",
      "relevantSection": "for(int i=0; i<=5; i++)",
      "suggestedCorrection": "for(int i = 0; i < 5; i++)",
      "whyItWorks": "Using strict `< 5` stops iteration when `i` reaches 5, preventing access to out-of-bounds memory.",
      "preventionTip": "Always verify upper loop bounds against array length `N`: use `i < N` instead of `i <= N`.",
      "isCertain": true
    }
  }
  ```

### `POST /api/ai/practice/generate`
Generates a complete, tailored programming exercise.
- **Body**:
  ```json
  {
    "language": "python",
    "topic": "Loops",
    "difficulty": "Beginner"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "title": "Count the Even Numbers",
      "description": "Write a program that takes a list of integers and counts how many are even.",
      "language": "python",
      "topic": "Loops",
      "difficulty": "Beginner",
      "inputDescription": "First line contains integer N, followed by N integers.",
      "outputDescription": "Print single integer representing the count of even numbers.",
      "constraints": "1 <= N <= 1000, -10^6 <= element <= 10^6",
      "sampleInput": "5\n1 2 3 4 5",
      "sampleOutput": "2",
      "conceptPracticed": "Using modulo operator inside loops"
    }
  }
  ```

### `POST /api/ai/hints`
Requests the next progressive hint level (Levels 1 to 4).
- **Body**:
  ```json
  {
    "problemId": "UUID or inline context",
    "language": "python",
    "problemTitle": "Count the Even Numbers",
    "problemDescription": "...",
    "requestedLevel": 1,
    "studentCode": "..."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "level": 1,
      "levelName": "Conceptual Hint",
      "hint": "Consider how arithmetic operations can determine if a number is divisible by 2 with no remainder.",
      "nextLevelAvailable": 2
    }
  }
  ```

### `POST /api/ai/solution`
Explicitly requests the Level 5 full solution with pedagogical breakdown.
- **Body**:
  ```json
  {
    "problemId": "UUID",
    "language": "python",
    "problemTitle": "Count the Even Numbers",
    "problemDescription": "..."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "level": 5,
      "solutionCode": "def count_evens(nums):\n    count = 0\n    for n in nums:\n        if n % 2 == 0:\n            count += 1\n    return count",
      "algorithmExplanation": "Initialize a counter at 0. Iterate through every number. If `n % 2 == 0`, increment counter.",
      "keyPoints": ["Zero is considered even", "Negative numbers also follow `% 2 == 0` in Python"],
      "edgeCases": "Empty array returns 0."
    }
  }
  ```

### `POST /api/ai/chat`
Conversational AI tutor endpoint with multi-turn support.
- **Body**:
  ```json
  {
    "conversationId": "UUID (optional)",
    "language": "c",
    "message": "What is the difference between malloc and calloc in C?",
    "history": [ ... ]
  }
  ```

---

## 4. Conversations & Practice Management

- `GET /api/conversations`: List all user conversations
- `POST /api/conversations`: Create a new conversation
- `GET /api/conversations/:id`: Retrieve conversation with message history
- `PATCH /api/conversations/:id`: Rename conversation title
- `DELETE /api/conversations/:id`: Delete conversation and child messages
- `GET /api/practice`: List saved practice problems
- `POST /api/practice`: Save a practice problem
- `GET /api/practice/:id`: Get a specific practice problem
- `POST /api/practice/:id/attempts`: Record a practice attempt & hints used
- `GET /api/practice/attempts`: Get user attempt history
- `GET /api/dashboard/stats`: Aggregated user statistics (attempts, completions, questions, top languages)
- `GET /api/dashboard/activity`: Recent learning activity stream
