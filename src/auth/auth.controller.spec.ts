import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

jest.mock('./auth.service');

describe('Auth Controller', () => {
  let sut: AuthController;
  let authService: AuthService;

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService, // mocked
      ]
    }).compile();

    sut = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.spyOn(authService, 'generateToken').mockReturnValue({ token: '123.abc.xyz', jwtPayload: { hashedPassportId: 'HASHED_TOKEN' }});

  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Should create a jwt', async () => {
    const jwt = sut.getToken({ passportId: 'X' })

    expect(jwt.token).toBe("123.abc.xyz");
    expect(jwt.jwtPayload.hashedPassportId).toBe('HASHED_TOKEN');
  });
});
