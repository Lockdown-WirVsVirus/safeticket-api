import { Module, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TicketingModule } from '../ticketing/ticketing.module';

@Module({
    imports: [
        PassportModule,
        // loading JwtModule async to have access to process.env via ConfigService
        JwtModule.registerAsync({
            useFactory: async () => ({
                secret: process.env.JWT_SECRET || 'ShVmYq3t6w9y$B&E)H@McQfTjWnZr4u7',
            }),
        }),
        // TODO: move HashingService
        TicketingModule,
    ],
    providers: [AuthService],
    exports: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {
    private readonly logger = new Logger(AuthModule.name);

    constructor() {
        if (!process.env.JWT_SECRET) {
            this.logger.warn('no JWT_SECRET found.');
        }
    }
}
