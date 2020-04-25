import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HashingService } from '../../crypto/services/hashing.service';

export interface IGenerateTokenPayload {
    passportId: string;
}

export interface IJwtTokenPayload {
    hashedPassportId: string;
}

export interface IGenerateTokenResponse {
    token: string;
    jwtPayload: IJwtTokenPayload;
}

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService, private hashingService: HashingService) {}

    async generateToken(payload: IGenerateTokenPayload): Promise<IGenerateTokenResponse> {
        const { passportId, ...other } = payload;
        const hashedPassportId = await this.hashingService.hashPassportId(passportId);
        const jwtPayload = {
            hashedPassportId,
            ...other,
        };
        return Promise.resolve({
            token: this.jwtService.sign(jwtPayload),
            jwtPayload,
        });
    }

    verifyToken(jwt: string): Promise<IJwtTokenPayload> {
        // return this.jwtService.verify(jwt) as IJwtTokenPayload;
        return this.jwtService.verifyAsync<IJwtTokenPayload>(jwt);
    }
}
