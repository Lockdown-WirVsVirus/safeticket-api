import { Injectable, Logger } from '@nestjs/common';
import CryptoJS = require('crypto-js');

@Injectable()
export class HashingService {
    private readonly logger = new Logger(HashingService.name);
    private readonly salt = process.env.PASSPORTID_SALT || 'super-long-and-secure-salt-from-backend';

    /**
     * Builds an new hash of given passport id and returns it.
     * @param passportId a new passport id to be hashed
     */
    async hashPassportId(passportId: string): Promise<string> {
        try {
            if (!passportId) {
                throw new Error('No passpord id provided for hashing');
            }

            if (!this.salt) {
                throw new Error('No PASSPORTID_SALT configured for hashing');
            }

            const hashedPassportId: string = CryptoJS.SHA256(this.salt + passportId).toString();

            this.logger.debug(`Create new hashed passport id: ${hashedPassportId}`);

            return Promise.resolve(hashedPassportId);
        } catch (e) {
            this.logger.error('Failure to create new hashed passport id: ' + e);
            return Promise.reject(e);
        }
    }
}
