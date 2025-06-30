import { authControllers } from '../../src/controllers/auth.controller';
import { AuthServices } from '../../src/services/auth.service';
import config from '../../src/config';
import { Request, Response } from 'express';

jest.mock('../../src/services/auth.service');

const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    res.cookie = jest.fn().mockReturnThis();
    return res as Response;
};

describe('authControllers', () => {
    let res: Response;

    beforeEach(() => {
        res = mockResponse();
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a user and return success', async () => {
            const req = { body: { email: 'test@mail.com', password: 'pass' } } as unknown as Request;
            const mockUser = { id: 1, email: 'test@mail.com' };
            (AuthServices.register as jest.Mock).mockResolvedValue(mockUser);
            const next = jest.fn();

            await authControllers.register(req, res, next);

            expect(AuthServices.register).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'User registered successfully!',
                data: mockUser,
            });
        });
    });

    describe('login', () => {
        it('should login a user and set refreshToken cookie', async () => {
            const req = { body: { email: 'test@mail.com', password: 'pass' } } as unknown as Request;
            const mockTokens = { accessToken: 'access', refreshToken: 'refresh' };
            (AuthServices.login as jest.Mock).mockResolvedValue(mockTokens);
            const next = jest.fn();

            await authControllers.login(req, res, next);

            expect(AuthServices.login).toHaveBeenCalledWith(req.body);
            expect(res.cookie).toHaveBeenCalledWith(
                'refreshToken',
                mockTokens.refreshToken,
                expect.objectContaining({
                    httpOnly: true,
                    secure: config.NODE_ENV === 'production',
                })
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'User logged in successfully!',
                data: { accessToken: mockTokens.accessToken },
            });
        });
    });

    describe('refreshToken', () => {
        it('should return 401 if no refresh token provided', async () => {
            const req = { headers: {} } as unknown as Request;
            const next = jest.fn();

            await authControllers.refreshToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'No refresh token provided',
            });
        });

        it('should refresh access token if refresh token is provided', async () => {
            const req = {
                headers: { cookie: 'refreshToken=refresh123' }
            } as unknown as Request;
            const mockAccessToken = { accessToken: 'newAccess' };
            (AuthServices.refreshToken as jest.Mock).mockResolvedValue(mockAccessToken);
            const next = jest.fn();

            await authControllers.refreshToken(req, res, next);

            expect(AuthServices.refreshToken).toHaveBeenCalledWith('refresh123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Access token refreshed successfully!',
                data: { accessToken: 'newAccess' },
            });
        });
    });
});
