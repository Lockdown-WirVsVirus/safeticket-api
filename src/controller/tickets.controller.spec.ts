import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from '../services/tickets.service';

describe('TicketsController', () => {
  let controller: TicketsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [TicketsService],
    }).compile();

    controller = app.get<TicketsController>(TicketsController);
  });

  describe('Request ticket ressources', () => {
    it('Should return ticket for 007', () => {
      const tickets = controller.ticketsRessource();
      expect(tickets.length).toBe(1);
      const { id } = tickets[0];
      expect('007').toBe(id);
    });
  });
});
