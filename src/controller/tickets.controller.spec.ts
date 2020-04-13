import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController, TicketRequestDto } from './tickets.controller';
import { TicketsService, Ticket } from '../services/tickets.service';
import { ticketModel } from '../schema/tickets.schema';
import { getModelToken } from '@nestjs/mongoose';

describe('TicketsController', () => {
  let controller: TicketsController;
  let mockedTicketService: TicketsService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        TicketsService,
        {
          provide: getModelToken('Tickets'),
          useValue: ticketModel,
        },
      ],
    }).compile();

    controller = app.get<TicketsController>(TicketsController);
    mockedTicketService = app.get<TicketsService>(TicketsService);

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
    jest
      .spyOn(mockedTicketService, 'createTicket')
      .mockImplementation(() => Promise.resolve(mockedTicket));
  });

  describe('Request ticket ressource', () => {
    it('Should create a ticket', async () => {
      const ticketDto: TicketRequestDto = new TicketRequestDto();
      const tickets = await controller.createTicket(ticketDto);

      expect(tickets.ticketId).toBeTruthy();
      expect(tickets.reason).toBeTruthy();
      expect(tickets.hashedPassportId).toBeTruthy();
      expect(tickets.ticketStatus).toBe('CREATED');
    });
  });
});
