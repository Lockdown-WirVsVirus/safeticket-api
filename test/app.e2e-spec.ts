import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { CryptoModule } from '../src/crypto/crypto.module';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { TicketingModule } from '../src/ticketing/ticketing.module';

describe('End-2-End Testing', () => {
    let app: INestApplication;
    let mongoDB: MongoMemoryServer;

    const timeout: number = 5_000;

    beforeEach(async () => {
        mongoDB = new MongoMemoryServer();
        const uri = await mongoDB.getUri();

        console.log('** start in memory mongodb: ', await mongoDB.getDbName());

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    envFilePath: ['test/.env.test'],
                }),
                MongooseModule.forRoot(uri),
                CryptoModule,
                AuthModule,
                TicketingModule,
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    }, timeout);

    afterEach(async () => {
        await mongoDB.stop();
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
            'generate pdf',
            async () => {
                await request(app.getHttpServer())
                    .post('/api/v1/tickets/generatePDF')
                    .expect(200)
                    .then(async creationResponse => {
                        console.debug(creationResponse.text);
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

    it(
        'can not create Ticket because ticket exist',
        async () => {
            return await request(app.getHttpServer())
                .post('/api/v1/tickets')
                .send(partyTicket)
                .expect(201)
                .then(async createError => {
                    await request(app.getHttpServer())
                        .post('/api/v1/tickets')
                        .send(partyTicket)
                        .expect(409);
                });
        },
        timeout,
    );

    it(
        'can not create Ticket because date is wrong',
        async () => {
            partyTicket.validToDateTime = '';
            return await request(app.getHttpServer())
                .post('/api/v1/tickets')
                .send(partyTicket)
                .expect(400);
        },
        timeout,
    );

    it(
        'can not create Ticket because id is wrong',
        async () => {
            partyTicket.passportId = '';
            return await request(app.getHttpServer())
                .post('/api/v1/tickets')
                .send(partyTicket)
                .expect(400);
        },
        timeout,
    );

    describe('Auth', () => {
        it(
            'should create jwt and use it',
            async () => {
                await request(app.getHttpServer())
                    .post('/api/v1/auth/token')
                    .send({
                        passportId: 'LXXXXX',
                    })
                    .expect(201)
                    .expect(async tokenResponse => {
                        const jwt = tokenResponse.body.token;
                        expect(jwt).toBeTruthy();
                        expect(tokenResponse.body.jwtPayload.hashedPassportId).toBeTruthy();
                        // validate signature against process.env from .env.test
                        const jwtServiceUtil = new JwtService({ secret: process.env.JWT_SECRET });
                        const verified = jwtServiceUtil.verify(jwt);
                        expect(verified).toBeTruthy();
                        expect(verified.hashedPassportId).toBe(tokenResponse.body.jwtPayload.hashedPassportId);

                        // use token to access secured controller
                        return await request(app.getHttpServer())
                            .get('/api/v1/auth/test')
                            .auth(jwt, { type: 'bearer' })
                            .expect(200)
                            .expect(testResponse => {
                                expect(testResponse.body.auth).toBe(true);
                                expect(testResponse.body.user.hashedPassportId).toBe(verified.hashedPassportId);
                                expect(testResponse.body.user.hashedPassportId).toBe(tokenResponse.body.jwtPayload.hashedPassportId);
                            });
                    });
            },
            timeout,
        );
    });
});
