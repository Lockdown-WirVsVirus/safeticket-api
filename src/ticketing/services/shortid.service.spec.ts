import { ShortidService } from './shortid.service';

describe('ShortidService', () => {
    // we just need one instance
    let service: ShortidService = new ShortidService();

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should generate shortid', () => {
        expect(service.generateShortId()).toMatch(/[0123456789abcdefghjklmnpqrstuvwxyz]{9}/);
    });
});
