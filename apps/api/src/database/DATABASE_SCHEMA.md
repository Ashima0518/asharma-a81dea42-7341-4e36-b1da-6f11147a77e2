# Database Entity Relationships

## Entity Overview

This document describes the database schema for the Task Management System with RBAC.

## Entities

### 1. **OrganizationEntity**
- **Table**: `organizations`
- **Purpose**: Represents a company or team workspace
- **Fields**:
  - `id` (UUID, Primary Key)
  - `name` (String, Unique)
- **Relationships**:
  - `users` → One-to-Many with UserEntity
  - `tasks` → One-to-Many with TaskEntity

---

### 2. **UserEntity**
- **Table**: `users`
- **Purpose**: System users with role-based access
- **Fields**:
  - `id` (UUID, Primary Key)
  - `email` (String, Unique)
  - `password` (String, Hashed)
  - `name` (String)
  - `role` (Enum: SUPER_ADMIN, ORG_ADMIN, MEMBER)
  - `organizationId` (UUID, Foreign Key)
  - `createdAt` (Timestamp)
  - `updatedAt` (Timestamp)
- **Relationships**:
  - `organization` → Many-to-One with OrganizationEntity
  - `assignedTasks` → One-to-Many with TaskEntity (tasks assigned to user)
  - `createdTasks` → One-to-Many with TaskEntity (tasks created by user)
  - `auditLogs` → One-to-Many with AuditLogEntity

---

### 3. **TaskEntity**
- **Table**: `tasks`
- **Purpose**: Tasks/work items within an organization
- **Fields**:
  - `id` (UUID, Primary Key)
  - `title` (String)
  - `description` (Text, Optional)
  - `status` (Enum: TODO, IN_PROGRESS, DONE)
  - `category` (String, Optional) - e.g., 'Work', 'Personal'
  - `order` (Integer) - for drag-and-drop ordering
  - `dueDate` (DateTime, Optional)
  - `organizationId` (UUID, Foreign Key)
  - `assignedToId` (UUID, Foreign Key, Optional)
  - `createdById` (UUID, Foreign Key)
  - `createdAt` (Timestamp)
  - `updatedAt` (Timestamp)
- **Relationships**:
  - `organization` → Many-to-One with OrganizationEntity
  - `assignedTo` → Many-to-One with UserEntity (optional)
  - `createdBy` → Many-to-One with UserEntity

---

### 4. **AuditLogEntity**
- **Table**: `audit_logs`
- **Purpose**: Security audit trail for all system actions
- **Fields**:
  - `id` (UUID, Primary Key)
  - `action` (String) - e.g., 'CREATE_TASK', 'UPDATE_TASK', 'DELETE_TASK'
  - `resource` (String) - e.g., 'Task', 'User', 'Organization'
  - `resourceId` (String, Optional) - ID of affected resource
  - `details` (Text, Optional) - JSON stringified context
  - `ipAddress` (String, Optional)
  - `userAgent` (String, Optional)
  - `userId` (UUID, Foreign Key, Optional)
  - `organizationId` (UUID, Foreign Key)
  - `createdAt` (Timestamp)
- **Relationships**:
  - `user` → Many-to-One with UserEntity (optional, for anonymous actions)
  - `organization` → Many-to-One with OrganizationEntity

---

## Entity Relationship Diagram (ERD)

```
┌──────────────────────┐
│  OrganizationEntity  │
│──────────────────────│
│ id (PK)              │
│ name                 │
└──────────────────────┘
         │
         │ 1:N
         ├────────────────────────────┐
         │                            │
         ▼                            ▼
┌──────────────────────┐    ┌──────────────────────┐
│    UserEntity        │    │    TaskEntity        │
│──────────────────────│    │──────────────────────│
│ id (PK)              │    │ id (PK)              │
│ email                │◄───│ assignedToId (FK)    │
│ password             │    │ createdById (FK)     │
│ name                 │    │ organizationId (FK)  │
│ role                 │    │ title                │
│ organizationId (FK)  │    │ description          │
│ createdAt            │    │ status               │
│ updatedAt            │    │ category             │
└──────────────────────┘    │ order                │
         │                  │ dueDate              │
         │ 1:N              │ createdAt            │
         │                  │ updatedAt            │
         ▼                  └──────────────────────┘
┌──────────────────────┐
│  AuditLogEntity      │
│──────────────────────│
│ id (PK)              │
│ action               │
│ resource             │
│ resourceId           │
│ details              │
│ ipAddress            │
│ userAgent            │
│ userId (FK)          │
│ organizationId (FK)  │
│ createdAt            │
└──────────────────────┘
```

## Role Hierarchy

- **SUPER_ADMIN**: Full system access across all organizations
- **ORG_ADMIN**: Full access within their organization
- **MEMBER**: Limited access to assigned tasks and own tasks

## Key Features

1. **Organization Isolation**: All data is scoped to organizations
2. **Role-Based Access Control (RBAC)**: Three-tier permission system
3. **Audit Trail**: Complete logging of all system actions
4. **Task Assignment**: Tasks can be assigned to specific users
5. **Soft Relationships**: Some foreign keys use SET NULL for data preservation
6. **Timestamps**: Automatic tracking of creation and modification times
7. **Drag-and-Drop Support**: Order field for task reordering

## Database Cascade Rules

- **Organization Deleted** → All related Users, Tasks, and AuditLogs are deleted
- **User Deleted** → 
  - Assigned tasks: assignedTo set to NULL
  - Created tasks: Deleted
  - Audit logs: userId set to NULL
- **Task Deleted** → No cascades (leaf entity)
