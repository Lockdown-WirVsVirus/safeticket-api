import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class HashingService {

    private readonly logger = new Logger(HashingService.name);



    hashPassportId(passportId: string) {

        const hashedPassportId = passportId;

        this.logger.verbose(`Create new hashs: ${hashedPassportId}`);

        return hashedPassportId;
    }
}
