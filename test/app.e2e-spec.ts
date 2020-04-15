import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { TicketingModule } from '../src/ticketing/ticketing.module';

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
  const partyTicket = {
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
    validFromDateTime: '2020-04-01T08:00:00.000Z',
    validToDateTime: '2020-04-01T10:00:00.000Z',
  };

  it('should create and get ticket', async () => {
    return await request(app.getHttpServer())
      .post('/api/v1/tickets')
      .send(partyTicket)
      .expect(201)
      .then(res => {
        expect(res.body.hashedPassportId).toBe(hashedPassportId);
      });
  });

  it(
    'search created ticket',
    async () => {
      return await request(app.getHttpServer())
        .post('/api/v1/tickets')
        .send(partyTicket)
        .expect(201)
        .then(async creationResponse => {
          const createdTicket = creationResponse.body;
          return await request(app.getHttpServer())
            .get('/api/v1/tickets/' + creationResponse.body.ticketId)
            .send()
            .expect(200)
            .expect(searchTicketResponse => {
              const sameTicketLikeCreated = searchTicketResponse.body;
              expect(sameTicketLikeCreated).toMatchObject(createdTicket);
            });
        });
    },
    timeout,
  );

  it(
    'search all created tickets by identity',
    async () => {
      return await request(app.getHttpServer())
        .post('/api/v1/tickets')
        .send(partyTicket)
        .expect(201)
        .then(async creationResponse => {
          const createdTicket = creationResponse.body;
          return await request(app.getHttpServer())
            .post('/api/v1/tickets/for/identity')
            .send({ hashedPassportId: createdTicket.hashedPassportId })
            .expect(200)
            .expect(allTicketsOfIdentityResponse => {
              const ticketsOfIdentity = allTicketsOfIdentityResponse.body;
              expect(ticketsOfIdentity.length).toBe(1);
              expect(ticketsOfIdentity[0]).toMatchObject(createdTicket);
            });
        });
    },
    timeout,
  );
});
