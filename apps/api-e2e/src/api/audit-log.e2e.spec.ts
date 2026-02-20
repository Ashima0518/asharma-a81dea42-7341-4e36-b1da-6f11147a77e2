import axios from 'axios';

const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}/api`;

async function getToken(email: string, password = 'Password123'): Promise<string> {
    const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
    return res.data.accessToken;
}

describe('Audit Log API', () => {
    let ownerToken: string;
    let viewerToken: string;

    beforeAll(async () => {
        ownerToken = await getToken('alice@company.com');
        viewerToken = await getToken('bob@company.com');
    });

    describe('GET /audit-log - access control', () => {
        it('OWNER should access audit-log and get 200', async () => {
            const res = await axios.get(`${BASE_URL}/audit-log`, {
                headers: { Authorization: `Bearer ${ownerToken}` },
            });
            expect(res.status).toBe(200);
            expect(Array.isArray(res.data)).toBe(true);
        });

        it('VIEWER should be blocked with 403 Forbidden', async () => {
            try {
                await axios.get(`${BASE_URL}/audit-log`, {
                    headers: { Authorization: `Bearer ${viewerToken}` },
                });
                fail('VIEWER should not access audit-log');
            } catch (err: any) {
                expect(err.response.status).toBe(403);
            }
        });

        it('unauthenticated request should return 401', async () => {
            try {
                await axios.get(`${BASE_URL}/audit-log`);
                fail('Expected 401');
            } catch (err: any) {
                expect(err.response.status).toBe(401);
            }
        });
    });

    describe('Audit log org scoping', () => {
        it('OWNER should only see audit logs from their own organization', async () => {
            // Get the owner's org info first
            const profileRes = await axios.get(`${BASE_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${ownerToken}` },
            });
            const ownerOrgId = profileRes.data.user.organizationId;

            const logsRes = await axios.get(`${BASE_URL}/audit-log`, {
                headers: { Authorization: `Bearer ${ownerToken}` },
            });

            (logsRes.data as any[]).forEach((log) => {
                expect(log.organizationId).toBe(ownerOrgId);
            });
        });

        it('task creation should generate an audit log entry', async () => {
            // Create a task
            await axios.post(
                `${BASE_URL}/tasks`,
                { title: 'Audit Log Test Task', status: 'TODO' },
                { headers: { Authorization: `Bearer ${ownerToken}` } }
            );

            // Check that audit log has a recent entry
            const logsRes = await axios.get(`${BASE_URL}/audit-log`, {
                headers: { Authorization: `Bearer ${ownerToken}` },
            });

            expect(logsRes.data.length).toBeGreaterThan(0);
            const latestLog = (logsRes.data as any[])[0];
            expect(latestLog).toHaveProperty('action');
            expect(latestLog).toHaveProperty('resource');
        });
    });
});
