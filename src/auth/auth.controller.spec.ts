import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

jest.mock('./auth.service');

describe('Auth Controller', () => {
    let sut: AuthController;
    let authService: AuthService;
    let jwtServiceMock = {
        sign: () => 'test',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                // AuthService required by Controller and JwtGuard
                // needs JwtService
                {
                    provide: JwtService,
                    useValue: jwtServiceMock,
                },
                AuthService, // mocked
            ],
        }).compile();

        sut = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);

        jest.spyOn(authService, 'generateToken').mockReturnValue(
            Promise.resolve({
                token: '123.abc.xyz',
                jwtPayload: { hashedPassportId: 'HASHED_TOKEN' },
            }),
        );
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should be defined', () => {
        expect(sut).toBeDefined();
    });

    describe('Generate Token', () => {
        it('Should create a jwt', async () => {
            const jwt = await sut.getToken({ passportId: 'X' });

            expect(jwt.token).toBe('123.abc.xyz');
            expect(jwt.jwtPayload.hashedPassportId).toBe('HASHED_TOKEN');
        });
    });

    describe('Auth with token', () => {
        it('should auth', async () => {
            const response = sut.testAuth({} as any, 'user');

            expect(response.auth).toBe(true);
            expect(response.user).toBe('user');
        });
    });
});
