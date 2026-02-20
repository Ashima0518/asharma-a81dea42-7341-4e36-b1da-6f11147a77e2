import axios from 'axios';

const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}/api`;

async function getToken(email: string, password = 'Password123'): Promise<string> {
    const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
    return res.data.accessToken;
}

describe('Tasks API', () => {
    let ownerToken: string;
    let viewerToken: string;
    let createdTaskId: string;

    beforeAll(async () => {
        ownerToken = await getToken('alice@company.com');
        viewerToken = await getToken('bob@company.com');
    });

    describe('POST /tasks - create', () => {
        it('should create a task and return 201', async () => {
            const res = await axios.post(
                `${BASE_URL}/tasks`,
                {
                    title: 'E2E Test Task',
                    description: 'Created by e2e test',
                    status: 'TODO',
                    category: 'WORK',
                },
                { headers: { Authorization: `Bearer ${ownerToken}` } }
            );
            expect(res.status).toBe(201);
            expect(res.data.title).toBe('E2E Test Task');
            expect(res.data.status).toBe('TODO');
            createdTaskId = res.data.id;
        });
    });

    describe('GET /tasks - list', () => {
        it('OWNER should see all tasks in their org', async () => {
            const res = await axios.get(`${BASE_URL}/tasks`, {
                headers: { Authorization: `Bearer ${ownerToken}` },
            });
            expect(res.status).toBe(200);
            expect(Array.isArray(res.data)).toBe(true);
        });

        it('VIEWER should only see tasks they created or are assigned to', async () => {
            const res = await axios.get(`${BASE_URL}/tasks`, {
                headers: { Authorization: `Bearer ${viewerToken}` },
            });
            expect(res.status).toBe(200);
            // Every returned task should be created by or assigned to the viewer
            const viewerLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'bob@company.com',
                password: 'Password123',
            });
            const viewerId = viewerLoginRes.data.user.id;
            (res.data as any[]).forEach((task) => {
                const isCreator = task.createdById === viewerId;
                const isAssignee = task.assignedToId === viewerId;
                expect(isCreator || isAssignee).toBe(true);
            });
        });

        it('should support category filter', async () => {
            const res = await axios.get(`${BASE_URL}/tasks?category=WORK`, {
                headers: { Authorization: `Bearer ${ownerToken}` },
            });
            expect(res.status).toBe(200);
            (res.data as any[]).forEach((task) => {
                expect(task.category).toBe('WORK');
            });
        });
    });

    describe('PUT /tasks/:id - update', () => {
        it('should update the task status', async () => {
            const res = await axios.put(
                `${BASE_URL}/tasks/${createdTaskId}`,
                { status: 'IN_PROGRESS' },
                { headers: { Authorization: `Bearer ${ownerToken}` } }
            );
            expect(res.status).toBe(200);
            expect(res.data.status).toBe('IN_PROGRESS');
        });
    });

    describe('DELETE /tasks/:id', () => {
        it('OWNER should delete the task successfully', async () => {
            const res = await axios.delete(`${BASE_URL}/tasks/${createdTaskId}`, {
                headers: { Authorization: `Bearer ${ownerToken}` },
            });
            expect([200, 204]).toContain(res.status);
        });

        it('should return 404 for a deleted task', async () => {
            try {
                await axios.get(`${BASE_URL}/tasks/${createdTaskId}`, {
                    headers: { Authorization: `Bearer ${ownerToken}` },
                });
                fail('Expected 404 for deleted task');
            } catch (err: any) {
                expect(err.response.status).toBe(404);
            }
        });
    });
});
