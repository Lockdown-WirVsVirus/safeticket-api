import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CryptoModule } from './crypto/crypto.module';
import { TicketingModule } from './ticketing/ticketing.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        ConfigModule.forRoot({
            // if a variable is found in multiple files, the first one takes precedence.
            envFilePath: ['.env.local', '.env'],
        }),
        MongooseModule.forRoot(process.env.MONGODB_URI, {
            // feature toggles to get rid of deprecation warnings.
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
        }),
        ScheduleModule.forRoot(),
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
