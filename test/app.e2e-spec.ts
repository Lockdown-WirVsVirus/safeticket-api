import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
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
            imports: [
                ConfigModule.forRoot({
                    envFilePath: ['test/.env.test'],
                }),
                MongooseModule.forRoot(uri),
                AuthModule,
                TicketingModule,
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    }, timeout);

    afterEach(async () => {
        await mongod.stop();
        await app.close();
    }, timeout);

    const hashedPassportId: string = 'df6c420ab8b18fba7230cf495638f3400132f896817f52d8bf0c717730340ce7';
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

    describe('Ticketing', () => {
        it('should create and get ticket', async () => {
            await request(app.getHttpServer())
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
                await request(app.getHttpServer())
                    .post('/api/v1/tickets')
                    .send(partyTicket)
                    .expect(201)
                    .then(async creationResponse => {
                        const createdTicket = creationResponse.body;
                        await request(app.getHttpServer())
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
                await request(app.getHttpServer())
                    .post('/api/v1/tickets')
                    .send(partyTicket)
                    .expect(201)
                    .then(async creationResponse => {
                        const createdTicket = creationResponse.body;
                        await request(app.getHttpServer())
                            .post('/api/v1/tickets/for/identity')
                            .send({
                                hashedPassportId: createdTicket.hashedPassportId,
                            })
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

    describe('Auth', () => {
        it(
            'should create jwt',
            async () => {
                await request(app.getHttpServer())
                    .post('/api/v1/auth/token')
                    .send({
                        passportId: 'LXXXXX',
                    })
                    .expect(201)
                    .expect(tokenResponse => {
                        expect(tokenResponse.body.token).toBeTruthy();
                        expect(tokenResponse.body.jwtPayload.hashedPassportId).toBeTruthy();
                        // validate signature against process.env from .env.test
                        const jwtServiceUtil = new JwtService({ secret: process.env.JWT_SECRET });
                        const verified = jwtServiceUtil.verify(tokenResponse.body.token);
                        expect(verified).toBeTruthy();
                        // decode jwt and check payload
                        const decoded = jwtServiceUtil.decode(tokenResponse.body.token);
                        expect(decoded).toBeTruthy();
                        expect(decoded['hashedPassportId']).toBe(tokenResponse.body.jwtPayload.hashedPassportId);
                    });
            },
            timeout,
        );
    });
});
