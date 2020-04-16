import { Body, Controller, Post } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { AuthService } from './auth.service';

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
