import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class HashingService {
    private readonly logger = new Logger(HashingService.name);

    hashPassportId(passportId: string) {
        // TODO: hash with static salt.
        return 'HASHED_' + passportId;
    }
}
