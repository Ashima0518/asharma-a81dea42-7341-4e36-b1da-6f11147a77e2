import axios from 'axios';

const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}/api`;

describe('Auth API', () => {
    describe('POST /auth/login - success', () => {
        it('should return 200 and an accessToken for valid credentials (OWNER)', async () => {
            const res = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'alice@company.com',
                password: 'Password123',
            });
            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('accessToken');
            expect(typeof res.data.accessToken).toBe('string');
            expect(res.data.user.role).toBe('OWNER');
        });

        it('should return 200 and accessToken for VIEWER login', async () => {
            const res = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'bob@company.com',
                password: 'Password123',
            });
            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('accessToken');
            expect(res.data.user.role).toBe('VIEWER');
        });
    });

    describe('POST /auth/login - failures', () => {
        it('should return 401 for an invalid password', async () => {
            try {
                await axios.post(`${BASE_URL}/auth/login`, {
                    email: 'alice@company.com',
                    password: 'WrongPassword!',
                });
                fail('Expected 401 but got a success response');
            } catch (err: any) {
                expect(err.response.status).toBe(401);
            }
        });

        it('should return 401 for a non-existent email', async () => {
            try {
                await axios.post(`${BASE_URL}/auth/login`, {
                    email: 'nobody@example.com',
                    password: 'Password123',
                });
                fail('Expected 401 but got a success response');
            } catch (err: any) {
                expect(err.response.status).toBe(401);
            }
        });
    });

    describe('GET /auth/profile', () => {
        it('should return the current user when JWT is provided', async () => {
            const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'alice@company.com',
                password: 'Password123',
            });
            const token = loginRes.data.accessToken;

            const profileRes = await axios.get(`${BASE_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            expect(profileRes.status).toBe(200);
            expect(profileRes.data.user.email).toBe('alice@company.com');
        });

        it('should return 401 when no JWT is provided', async () => {
            try {
                await axios.get(`${BASE_URL}/auth/profile`);
                fail('Expected 401');
            } catch (err: any) {
                expect(err.response.status).toBe(401);
            }
        });
    });
});
