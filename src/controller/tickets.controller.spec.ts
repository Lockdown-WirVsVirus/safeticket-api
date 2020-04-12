import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService, Ticket } from '../services/tickets.service';
import { ticketModel, TicketModel } from 'src/schema/tickets.schema';
import { TicketRequestDto } from './ticket.dto';
import { getModelToken } from '@nestjs/mongoose';
import { Mongoose, Model } from 'mongoose';

describe('TicketsController', () => {
  let controller: TicketsController;
  let ticketModel;

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
    ticketModel = jest.spyOn(ticketModel, 'save').mockReturnValue({});
  });

  describe('Request ticket ressources', () => {
    it('Should return ticket for 007', async () => {
      const ticketDto: TicketRequestDto = new TicketRequestDto();
      const tickets = await controller.createTicket(ticketDto);
    });
  });
});
