import { JwtService } from '@nestjs/jwt';
import { HashingService } from '../../crypto/services/hashing.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
    // mock dependent services
    const jwtService: JwtService = new JwtService({});
    const hashingService: HashingService = new HashingService();

    jest.spyOn(jwtService, 'sign').mockReturnValue('123.abc.xyz');
    jest.spyOn(hashingService, 'hashPassportId').mockImplementation((passportId: string) => Promise.resolve('#' + passportId));

    // we just need one instance
    let service: AuthService = new AuthService(jwtService, hashingService);

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should mock sign', () => {
        expect(jwtService.sign('x')).toBe('123.abc.xyz');
    });

    it('should generate token', async () => {
        const input = { passportId: 'X' };
        const expected = {
            token: '123.abc.xyz',
            jwtPayload: {
                hashedPassportId: '#X',
            },
        };
        expect(await service.generateToken(input)).toEqual(expected);
    });
});
