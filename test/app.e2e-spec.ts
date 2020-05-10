import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { CryptoModule } from '../src/crypto/crypto.module';
import { TicketingModule } from '../src/ticketing/ticketing.module';
import { Type } from 'class-transformer';

describe('End-2-End Testing', () => {
    let app: INestApplication;
    let mongoDB: MongoMemoryServer;

    const timeout: number = 120_000;

    beforeEach(async () => {
        mongoDB = new MongoMemoryServer();
        const uri = await mongoDB.getUri();

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

    // After each: stop mongodb
    afterEach(async () => {
        await mongoDB.stop();
        // will be restarted clean in BeforeEach
    }, timeout);

    // At the end: close app
    afterAll(async () => {
        await app.close();
    }, timeout);

    const hashedPassportId: string = 'df6c420ab8b18fba7230cf495638f3400132f896817f52d8bf0c717730340ce7';
    let dateInFuture = new Date();
    dateInFuture.setHours(dateInFuture.getHours() + 1);

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

        validFromDateTime: new Date().toISOString(),
        validToDateTime: dateInFuture.toISOString(),
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
            'generate pdf but request is wrong',
            async () => {
                await request(app.getHttpServer())
                    .post('/api/v1/tickets/pdf')
                    .expect(400);
            },
            timeout,
        );

        it(
            'generate PDF by Ticket id',
            async () => {
                await request(app.getHttpServer())
                    .post('/api/v1/tickets')
                    .send(partyTicket)
                    .expect(201)
                    .then(async creationResponse => {
                        const pdfrqeust = { lastname: 'Karl', firstname: 'K', ticketID: creationResponse.body.ticketId };
                        await request(app.getHttpServer())
                            .post('/api/v1/tickets/pdf')
                            .send(pdfrqeust)
                            .expect(200)
                            .then(async pdfResponse => {
                                expect(pdfResponse.text).toContain('JVBERi0xLjMKJf////8KNyAwIG9iago8PAovVHlw');
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

    it(
        'can not create Ticket because validFromDate is in the past',
        async () => {
            partyTicket.validFromDateTime = new Date('2019-01-16').toISOString();
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
