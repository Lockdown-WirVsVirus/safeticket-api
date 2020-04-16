import { Logger, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CryptoModule } from 'src/crypto/crypto.module';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './services/auth.service';

@Module({
    imports: [
        // loading JwtModule async to have access to process.env via ConfigService
        JwtModule.registerAsync({
            useFactory: async () => ({
                secret: process.env.JWT_SECRET || 'ShVmYq3t6w9y$B&E)H@McQfTjWnZr4u7',
            }),
        }),
        CryptoModule,
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
