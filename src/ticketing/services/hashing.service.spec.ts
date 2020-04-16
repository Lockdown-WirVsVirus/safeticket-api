import { Test, TestingModule } from '@nestjs/testing';
import { HashingService } from './hashing.service';

describe('HashingService', () => {
    let service: HashingService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [HashingService],
        }).compile();

        service = module.get<HashingService>(HashingService);
    });

    it('hahsing service should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should hash given passport id', async () => {
        expect(await service.hashPassportId('Ironman')).toBe('77fd3004ba0d5c69b05e01c84b0456e2d8c6e79b7f6b852b07a29db4c1ff682e');
    });

    it('should throw error on passed provided passport id', async () => {
        try {
            await service.hashPassportId('');
            fail(new Error('Should not be reached'));
        } catch (err) {
            const error: Error = new Error('No passpord id provided for hashing');
            expect(err.message).toBe(error.message);
        }
    });

    it('should throw error on no provided passport id', async () => {
        try {
            await service.hashPassportId(null);
            fail(new Error('Should not be reached'));
        } catch (err) {
            const error: Error = new Error('No passpord id provided for hashing');
            expect(err.message).toBe(error.message);
        }
    });
});
