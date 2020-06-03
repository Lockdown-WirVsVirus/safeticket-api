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

    it('hashing service should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should hash given passport id', async () => {
        expect(await service.hashPassportId('Ironman')).toBe('92944fb7d764dde20ea14d8cd8c38175893e71d5ad8b8ffc41978f18bb6b5594');
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
