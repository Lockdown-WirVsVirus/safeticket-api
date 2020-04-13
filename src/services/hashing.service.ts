import { Injectable } from '@nestjs/common';

@Injectable()
export class HashingService {
    hashPassportId(passportId: string) {
        // TODO: hash with static salt.
        return 'HASHED_' + passportId;
    }
}
