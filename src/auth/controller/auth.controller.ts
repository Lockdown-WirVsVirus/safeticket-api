import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { AuthService } from '../services/auth.service';
import { JwtGuard } from '../jwt.guard';
import { User } from '../user.decorator';

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
    async getToken(@Body() payload: AuthPayloadDto): Promise<JwtTokenDto> {
        return await this.authService.generateToken(payload);
    }

    @Get('test')
    @UseGuards(JwtGuard)
    testAuth(@Request() req: ExpressRequest, @User() user: string) {
        return {
            auth: true,
            'req.user': req.user,
            user,
        };
    }
}
