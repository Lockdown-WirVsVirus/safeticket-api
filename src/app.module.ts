import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CryptoModule } from './crypto/crypto.module';
import { TicketingModule } from './ticketing/ticketing.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            // if a variable is found in multiple files, the first one takes precedence.
            envFilePath: ['.env.local', '.env'],
        }),
        MongooseModule.forRoot(process.env.MONGODB_URI),
        CryptoModule,
        TicketingModule,
        AuthModule,
    ],
})
export class AppModule {
    constructor() {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            console.error('no MONGODB_URI found. Please set.');
            process.exit(1);
        }
    }
}
