export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    category?: 'WORK' | 'PERSONAL' | 'URGENT' | 'OTHER';
    organizationId: string;
    creatorId: string;
    assignedToId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type TaskStatus = Task['status'];
