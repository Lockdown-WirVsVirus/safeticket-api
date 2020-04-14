import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  TicketRequestDto,
  TicketResponseDto,
} from '../src/ticketing/controller/tickets.controller';
import { TicketingModule } from '../src/ticketing/ticketing.module';
import { doesNotMatch } from 'assert';

describe('End-2-End Testing', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

  const timeout: number = 5_000;

  beforeEach(async () => {
    mongod = new MongoMemoryServer();
    const uri = await mongod.getUri();

    console.log('** start in memory mongodb: ', await mongod.getDbName());

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(uri), TicketingModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, timeout);

  afterEach(async () => {
    await mongod.stop();
    await app.close();
  }, timeout);

  const hashedPassportId: string = 'HASHED_LXXXXXXX';
  const partyTicket: TicketRequestDto = {
    passportId: 'LXXXXXXX',
    reason: 'Party',
    startAddress: {
      street: 'Straße',
      houseNumber: '1',
      zipCode: '01234',
      city: 'Stadt',
      country: 'Germany',
    },
    endAddress: {
      street: 'Straße',
      houseNumber: '1',
      zipCode: '01234',
      city: 'Stadt',
      country: 'Germany',
    },
    validFromDateTime: new Date(2020, 4, 1, 8, 0, 0), //01.04.2020 - 08:00
    validToDateTime: new Date(2020, 4, 1, 10, 0, 0), //01.04.2020 - 10:00
  };

  it('should create and get ticket', done => {
    return request(app.getHttpServer())
      .post('/api/v1/tickets')
      .send(partyTicket)
      .expect(201)
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body.hashedPassportId).toBe(hashedPassportId);
        done();
      });
  });

  it(
    'search created ticket',
    async () => {
      return request(app.getHttpServer())
        .post('/api/v1/tickets')
        .send(partyTicket)
        .expect(201)
        .then(creationResponse => {
          const createdTicket: TicketResponseDto = creationResponse.body;
          return request(app.getHttpServer())
            .get('/api/v1/tickets/' + creationResponse.body.ticketId)
            .send()
            .expect(200)
            .expect(searchTicketResponse => {
              const sameTicketLikeCreated: TicketResponseDto =
                searchTicketResponse.body;
              expect(sameTicketLikeCreated).toMatchObject(createdTicket);
            });
        });
    },
    timeout,
  );

  it(
    'search all created tickets by identity',
    async () => {
      return request(app.getHttpServer())
        .post('/api/v1/tickets')
        .send(partyTicket)
        .expect(201)
        .then(creationResponse => {
          const createdTicket: TicketResponseDto = creationResponse.body;
          return request(app.getHttpServer())
            .post('/api/v1/tickets/identity')
            .send({ hashedPassportId: createdTicket.hashedPassportId })
            .expect(200)
            .expect(allTicketsOfIdentityResponse => {
              const ticketsOfIdentity: TicketResponseDto[] = allTicketsOfIdentityResponse.body;
              expect(ticketsOfIdentity.length).toBe(1);
              expect(ticketsOfIdentity[0]).toMatchObject(createdTicket);
            });
        });
    },
    timeout,
  );
});
