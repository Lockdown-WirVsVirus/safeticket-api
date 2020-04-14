import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { TicketRequestDto } from '../../src/ticketing/controller/tickets.controller';
import { TicketingModule } from '../../src/ticketing/ticketing.module';

describe('Ticketing (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

  beforeEach(async () => {
    mongod = new MongoMemoryServer();
    const uri = await mongod.getUri();

    console.log('** start in memory mongodb: ', await mongod.getDbName());

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(uri), TicketingModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 5_000);

  afterEach(async () => {
    await mongod.stop();
    await app.close();
  }, 5_000);

  const hashedPassportId: string = '#LXXXXXXX';
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

  it('search created ticket', async done => {
    const creationResponse = await request(app.getHttpServer())
      .post('/api/v1/tickets')
      .send(partyTicket)
      .expect(201);
    expect(creationResponse.body.ticketId).toBeTruthy();
    const findTicketResponse = await request(app.getHttpServer())
      .get('/api/v1/tickets/' + creationResponse.body.ticketId)
      .send()
      .expect(200);
    expect(findTicketResponse.body).toMatchObject(creationResponse);
    done();
  });
});
