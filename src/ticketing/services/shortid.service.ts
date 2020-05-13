import { Injectable } from '@nestjs/common';

import { customAlphabet as customNanoid } from 'nanoid';

@Injectable()
export class ShortidService {
    /**
     * use https://zelark.github.io/nano-id-cc/ to calculate collision of alphabet and size
     */

    // numbers and lowercase (without O and I)
    private alphabet = '0123456789' + 'abcdefghjklmnpqrstuvwxyz';
    /**
     * Speed: 1000 IDs per hour
     * ~46 days needed, in order to have a 1% probability of at least one collision.
     */
    private nanoid = customNanoid(this.alphabet, 9);

    generateShortId() {
        return this.nanoid();
    }
}
