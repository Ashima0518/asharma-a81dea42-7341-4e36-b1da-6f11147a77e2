import axios from 'axios';

const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}/api`;

/**
 * Helper: log in and return a Bearer token for the given account.
 */
async function getToken(email: string, password = 'Password123'): Promise<string> {
    const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
    return res.data.accessToken;
}

describe('RBAC - Role Based Access Control', () => {
    let ownerToken: string;
    let viewerToken: string;

    beforeAll(async () => {
        ownerToken = await getToken('alice@company.com');
        viewerToken = await getToken('bob@company.com');
    });

    describe('GET /tasks - visibility by role', () => {
        it('OWNER should be able to access GET /tasks', async () => {
            const res = await axios.get(`${BASE_URL}/tasks`, {
                headers: { Authorization: `Bearer ${ownerToken}` },
            });
            expect(res.status).toBe(200);
        });

        it('VIEWER should be able to access GET /tasks (sees only own tasks)', async () => {
            const res = await axios.get(`${BASE_URL}/tasks`, {
                headers: { Authorization: `Bearer ${viewerToken}` },
            });
            expect(res.status).toBe(200);
        });

        it('should return 401 with no token', async () => {
            try {
                await axios.get(`${BASE_URL}/tasks`);
                fail('Expected 401');
            } catch (err: any) {
                expect(err.response.status).toBe(401);
            }
        });
    });

    describe('GET /audit-log - blocked for VIEWER', () => {
        it('OWNER should access /audit-log successfully', async () => {
            const res = await axios.get(`${BASE_URL}/audit-log`, {
                headers: { Authorization: `Bearer ${ownerToken}` },
            });
            expect(res.status).toBe(200);
        });

        it('VIEWER should receive 403 Forbidden when accessing /audit-log', async () => {
            try {
                await axios.get(`${BASE_URL}/audit-log`, {
                    headers: { Authorization: `Bearer ${viewerToken}` },
                });
                fail('Expected 403 for VIEWER on audit-log');
            } catch (err: any) {
                expect(err.response.status).toBe(403);
            }
        });
    });

    describe('POST /tasks - create task', () => {
        it('OWNER should be able to create a task', async () => {
            const res = await axios.post(
                `${BASE_URL}/tasks`,
                { title: 'RBAC Test Task', status: 'TODO', category: 'WORK' },
                { headers: { Authorization: `Bearer ${ownerToken}` } }
            );
            expect(res.status).toBe(201);
            expect(res.data).toHaveProperty('id');
        });

        it('VIEWER should not be able to delete a task they did not create', async () => {
            // First create a task as OWNER
            const createRes = await axios.post(
                `${BASE_URL}/tasks`,
                { title: 'Task to be deleted', status: 'TODO' },
                { headers: { Authorization: `Bearer ${ownerToken}` } }
            );
            const taskId = createRes.data.id;

            // VIEWER tries to delete it
            try {
                await axios.delete(`${BASE_URL}/tasks/${taskId}`, {
                    headers: { Authorization: `Bearer ${viewerToken}` },
                });
                fail('Expected 403 for VIEWER trying to delete an unowned task');
            } catch (err: any) {
                expect([403, 404]).toContain(err.response.status);
            }
        });
    });
});
