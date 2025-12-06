```mermaid
erDiagram
    USERS ||--o{ USERSETTINGS : "has"
    USERS ||--o{ PASSWORDRESETTOKENS : "has"
    USERS ||--o{ REFRESHTOKENS : "has"
    USERS ||--o{ USERACTIVITYLOGS : "logs"
    USERS ||--o{ CATEGORIES : "creates"
    USERS ||--o{ ACTIVITYCATEGORIES : "creates"
    USERS ||--o{ SCHEDULES : "owns"
    USERS ||--o{ EVENTS : "owns"
    USERS ||--o{ SCHEDULEPARTICIPANTS : "participates_in"
    USERS ||--o{ SHAREDSCHEDULES : "shares"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ FEEDBACK : "sends"

    CATEGORIES ||--o{ SCHEDULES : "categorizes"
    ACTIVITYCATEGORIES ||--o{ EVENTS : "categorizes"
    
    SCHEDULES ||--o{ EVENTS : "contains"
    SCHEDULES ||--o{ SCHEDULEPARTICIPANTS : "has_participants"
    SCHEDULES ||--o{ SHAREDSCHEDULES : "is_shared_via"
    SCHEDULES ||--o{ REMINDERS : "has_reminders"

    EVENTS ||--o{ EVENTREMINDERS : "has_reminders"

    USERS {
        int id PK
        string email
        string password_hash
        string role
    }
    SCHEDULES {
        int id PK
        int user_id FK
        string title
        datetime start_time
        datetime end_time
    }
    EVENTS {
        int id PK
        int schedule_id FK
        string title
        datetime start_time
    }
    CATEGORIES {
        int id PK
        string name
        string color
    }
