import { Controller, Post, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiProperty } from '@nestjs/swagger';

export class AuthPayloadDto {
    @ApiProperty()
    passportId: string;
}

export class JwtTokenDto {
    @ApiProperty()
    token: string;

    @ApiProperty()
    jwtPayload: any;
}

@Controller('api/v1/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('token')
    getToken(@Body() payload: AuthPayloadDto): JwtTokenDto {
        return this.authService.generateToken(payload);
    }
}
