import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { ticketSchema } from '../src/schema/tickets.schema';
import { TicketsController } from '../src/controller/tickets.controller';
import { TicketsService } from '../src/services/tickets.service';
import { HashingService } from '../src/services/hashing.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { TicketRequestDto } from 'src/controller/ticket.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let mongod = new MongoMemoryServer();

  beforeEach(async () => {
    const uri = await mongod.getUri();

    console.log('** in memory mongodb: uri ' + uri);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: 'Tickets', schema: ticketSchema }]),
      ],
      controllers: [TicketsController],
      providers: [TicketsService, HashingService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 5_000);

  afterEach(async () => {
    await mongod.stop();
    await app.close();
  }, 5_000)

  it('should create and get ticket', () => {
    const ticketRequest: TicketRequestDto = {
        passportId: 'LXXXXXXX',
        reason: 'Party',
        startAddress: { street: 'Straße', houseNumber: '1', zipCode: '01234', city: 'Stadt', country: 'Germany' },
        endAddress: { street: 'Straße', houseNumber: '1', zipCode: '01234', city: 'Stadt', country: 'Germany' },
        validFromDateTime: new Date(),
        validToDateTime: new Date(),
    }
    return request(app.getHttpServer())
      .post('/api/v1/tickets')
      .send(ticketRequest)
      .expect(201);
  });
});
