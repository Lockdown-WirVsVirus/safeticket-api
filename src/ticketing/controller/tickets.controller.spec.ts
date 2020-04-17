import { Test, TestingModule } from '@nestjs/testing';
import { HashingService } from '../services/hashing.service';
import { Ticket, TicketsService } from '../services/tickets.service';
import { TicketRequestDto, TicketsController } from './tickets.controller';

jest.mock('../services/tickets.service');

describe('TicketsController', () => {
    let sut: TicketsController;
    let ticketService: TicketsService;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [TicketsController],
            providers: [
                HashingService,
                TicketsService, // mocked
            ],
        }).compile();

        sut = app.get<TicketsController>(TicketsController);
        ticketService = app.get<TicketsService>(TicketsService);

        // Mock ticket save to db
        const mockedTicket: Ticket = {
            ticketId: 'testing',
            reason: 'simulation',
            startAddress: {
                street: '',
                houseNumber: '',
                zipCode: '',
                city: '',
                country: '',
            },
            endAddress: {
                street: '',
                houseNumber: '',
                zipCode: '',
                city: '',
                country: '',
            },
            hashedPassportId: 'wdasdsdas',
            ticketStatus: 'CREATED',
            validFromDateTime: new Date(),
            validToDateTime: new Date(),
        };
        jest.spyOn(ticketService, 'createTicket').mockReturnValue(Promise.resolve(mockedTicket));
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('Request ticket ressource', () => {
        it('Should create a ticket', async () => {
            const ticketDto: TicketRequestDto = new TicketRequestDto();
            const tickets = await sut.createTicket(ticketDto);

            expect(tickets.ticketId).toBeTruthy();
            expect(tickets.reason).toBeTruthy();
            expect(tickets.hashedPassportId).toBeTruthy();
            expect(tickets.ticketStatus).toBe('CREATED');
        });
    });
});
