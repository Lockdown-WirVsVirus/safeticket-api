import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { HashingService } from '../ticketing/services/hashing.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
    // mock dependent services
    const jwtService: JwtService = new JwtService({});
    const hashingService: HashingService = new HashingService();
    jest.spyOn(jwtService, 'sign').mockReturnValue('123.abc.xyz');
    jest.spyOn(hashingService, 'hashPassportId').mockImplementation(
        (passportId: string) => '#' + passportId,
    );

    // we just need one instance
    let service: AuthService = new AuthService(jwtService, hashingService);

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should mock sign', () => {
        expect(jwtService.sign('x')).toBe('123.abc.xyz');
    });

    it('should generate token', () => {
        const input = { passportId: 'X' };
        const expected = {
            token: '123.abc.xyz',
            jwtPayload: {
                hashedPassportId: '#X',
            },
        };
        expect(service.generateToken(input)).toEqual(expected);
    });
});
