import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HashingService } from '../ticketing/services/hashing.service';

export interface IGenerateTokenPayload {
    passportId: string;
}
export interface IJwtTokenPayload {
    token: string;
    jwtPayload: {
        hashedPassportId;
    };
}

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private hashingService: HashingService,
    ) {}

    generateToken(payload: IGenerateTokenPayload): IJwtTokenPayload {
        const { passportId, ...other } = payload;
        const hashedPassportId = this.hashingService.hashPassportId(passportId);
        const jwtPayload = {
            hashedPassportId,
            ...other,
        };
        return {
            token: this.jwtService.sign(jwtPayload),
            jwtPayload,
        };
    }
}
