# CodeBuddy AI — Database Schema & Security Specification

CodeBuddy AI uses PostgreSQL hosted on Supabase, leveraging **Row Level Security (RLS)**, foreign keys with cascading deletes, indexing on query paths, and automated timestamp triggers.

---

## 1. Schema Diagram (ERD)

```mermaid
erDiagram
    auth_users ||--|| profiles : "has profile"
    auth_users ||--o{ conversations : "owns"
    conversations ||--o{ conversation_messages : "contains"
    auth_users ||--o{ practice_problems : "creates"
    practice_problems ||--o{ practice_attempts : "attempted in"
    auth_users ||--o{ practice_attempts : "attempts"
    auth_users ||--o{ learning_activity : "logs"

    profiles {
        uuid id PK "references auth.users"
        text display_name
        timestamptz created_at
        timestamptz updated_at
    }

    conversations {
        uuid id PK
        uuid user_id FK "references auth.users"
        text title
        text language
        timestamptz created_at
        timestamptz updated_at
    }

    conversation_messages {
        uuid id PK
        uuid conversation_id FK "references conversations"
        text role "user | assistant"
        text content
        timestamptz created_at
    }

    practice_problems {
        uuid id PK
        uuid user_id FK "references auth.users"
        text language
        text topic
        text difficulty "Beginner | Intermediate | Advanced"
        text title
        text description
        text input_description
        text output_description
        text constraints
        text sample_input
        text sample_output
        timestamptz created_at
    }

    practice_attempts {
        uuid id PK
        uuid user_id FK "references auth.users"
        uuid problem_id FK "references practice_problems"
        text submitted_code
        integer hints_used
        boolean completed
        timestamptz created_at
        timestamptz updated_at
    }

    learning_activity {
        uuid id PK
        uuid user_id FK "references auth.users"
        text activity_type
        text language
        text topic
        jsonb metadata
        timestamptz created_at
    }
```

---

## 2. Row Level Security (RLS) Strategy

Row Level Security is enabled on **every** user-facing table. Supabase passes the authenticated JWT's subject claim as `auth.uid()`.

### Policies Summary:
1. **`profiles`**:
   - `SELECT`: `auth.uid() = id`
   - `INSERT`: `auth.uid() = id`
   - `UPDATE`: `auth.uid() = id`
2. **`conversations`**:
   - `ALL`: `auth.uid() = user_id`
3. **`conversation_messages`**:
   - Parent-child check:
     `EXISTS (SELECT 1 FROM conversations WHERE conversations.id = conversation_messages.conversation_id AND conversations.user_id = auth.uid())`
4. **`practice_problems`**:
   - `ALL`: `auth.uid() = user_id`
5. **`practice_attempts`**:
   - `ALL`: `auth.uid() = user_id`
6. **`learning_activity`**:
   - `ALL`: `auth.uid() = user_id`

This prevents Horizontal Privilege Escalation (IDOR) attacks: even if an attacker guesses a valid UUID belonging to another student, PostgreSQL rejects the query at the database engine level.
