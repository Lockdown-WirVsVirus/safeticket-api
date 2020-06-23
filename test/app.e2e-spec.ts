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
import MockDate from 'mockdate';
import * as moment from 'moment';

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
                    envFilePath: ['test/.env.e2e'],
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

    const createTimeTicket = (dateFrom: Date, dateTo: Date) => {
        return {
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

            validFromDateTime: dateFrom.toISOString(),
            validToDateTime: dateTo.toISOString(),
        };
    };

    describe('Ticketing', () => {
        it('should create and get ticket', async () => {
            await request(app.getHttpServer())
                .post('/api/v1/tickets')
                .send(partyTicket)
                .expect(201)
                .then(res => {
                    expect(res.body.hashedPassportId).toBe(hashedPassportId);
                    expect(res.body.verificationCode).toMatch(/[0123456789abcdefghjklmnpqrstuvwxyz]{9}/);
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
                    .post('/api/v1/tickets/1234/pdf')
                    .send()
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
                            .post('/api/v1/tickets/' + creationResponse.body.ticketId + '/pdf')
                            .send()
                            .expect(200)
                            .then(async pdfResponse => {
                                expect(pdfResponse.get('Content-Type')).toBe('application/pdf');
                                expect(pdfResponse.get('Content-Disposition')).toContain('attachment');
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

        it(
            'invalid ticket by id',
            async () => {
                await request(app.getHttpServer())
                    .post('/api/v1/tickets')
                    .send(partyTicket)
                    .expect(201)
                    .then(async creationResponse => {
                        const createdTicket = creationResponse.body;
                        await request(app.getHttpServer())
                            .delete('/api/v1/tickets/' + createdTicket.ticketId)
                            .expect(204);
                    });
            },
            timeout,
        );

        it(
            'invalid ticket',

            async () => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                await request(app.getHttpServer())
                    .post('/api/v1/tickets')
                    .send(partyTicket)
                    .expect(201)
                    .then(async creationResponse => {
                        MockDate.set('2200-11-22'); // jump to the futur, so the new ticket is invalid
                        await request(app.getHttpServer())
                            .delete('/api/v1/tickets/')
                            .expect(204);
                        await request(app.getHttpServer())
                            .get('/api/v1/tickets/' + creationResponse.body.ticketId)
                            .send()
                            .expect(200)
                            .then(ticket => {
                                const t = ticket.body;
                                expect(t.status).toBe('EXPIRED');
                            });
                    });
            },
            timeout,
        );

        it(
            'can not create Ticket because ticket time conflicts',
            async () => {
                // first datetime
                const from1 = moment()
                    .add(1, 'day')
                    .hours(13)
                    .minutes(0);
                const to1 = moment()
                    .add(1, 'day')
                    .hours(16)
                    .minutes(0);
                // 2nd datetime overlapping from
                const from2 = moment()
                    .add(1, 'day')
                    .hours(14)
                    .minutes(0);
                const to2 = moment()
                    .add(1, 'day')
                    .hours(17)
                    .minutes(0);
                // 3rd datetime overlapping to
                const from3 = moment()
                    .add(1, 'day')
                    .hours(12)
                    .minutes(30);
                const to3 = moment()
                    .add(1, 'day')
                    .hours(13)
                    .minutes(30);
                // 4th datetime inside first
                const from4 = moment()
                    .add(1, 'day')
                    .hours(13)
                    .minutes(30);
                const to4 = moment()
                    .add(1, 'day')
                    .hours(14)
                    .minutes(30);

                const firstTicket = createTimeTicket(from1.toDate(), to1.toDate());
                const secondTicket = createTimeTicket(from2.toDate(), to2.toDate());
                const thirdTicket = createTimeTicket(from3.toDate(), to3.toDate());
                const forthTicket = createTimeTicket(from4.toDate(), to4.toDate());

                return await request(app.getHttpServer())
                    .post('/api/v1/tickets')
                    .send(firstTicket)
                    .expect(201)
                    .then(async createError => {
                        return Promise.all([
                            // second
                            request(app.getHttpServer())
                                .post('/api/v1/tickets')
                                .send(secondTicket)
                                .expect(409),
                            // third
                            request(app.getHttpServer())
                                .post('/api/v1/tickets')
                                .send(thirdTicket)
                                .expect(409),
                            // forth
                            request(app.getHttpServer())
                                .post('/api/v1/tickets')
                                .send(forthTicket)
                                .expect(409),
                        ]);
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
            'can not create Ticket because passportId is wrong',
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
    });

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
