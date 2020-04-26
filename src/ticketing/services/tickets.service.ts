import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { err, ok, Result } from 'neverthrow';
import { TicketModel, TICKET_MODEL_NAME } from './tickets.schema';
import { CounterModel, COUNTER_MODEL_NAME } from './counter.schema';
import { randomSpeakableCharGenerator } from './randomSpeakable';

/**
 * Enumeration of reason why ticket creation failed.
 */
export enum TicketCreationFailureReason {
    /**
     * There exists a same ticket for the same time.
     */
    ConflictInTime,
    /**
     * Undefined technical error.
     */
    InternalError,
}
/**
 * Custom failure holder  for reason why ticket creation has been aborted or declined.
 */
export class TicketCreationFailure {
    constructor(public readonly reason: TicketCreationFailureReason, public readonly error?: Error) {}
}

export interface TicketID {
    searchTicketId: string;
}

export interface Address {
    street: string;
    houseNumber: string;
    zipCode: string;
    city: string;
    country: string;
}
export type TicketStatus = 'CREATED' | 'EXPIRED' | 'DECLINED';

export interface Identity {
    hashedPassportId: string;
}

export interface TicketRequest extends Identity {
    reason: string;

    startAddress: Address;
    endAddress: Address;

    validFromDateTime: Date;
    validToDateTime: Date;
}

export interface Ticket extends TicketRequest {
    ticketId: string;
    ticketStatus: TicketStatus;
    verificationCode: string;
}

const AUTO_INC_VERIFICATION_CODE = 'verificationCode';

/**
 * Service for handling all tickets agnostic to any external access point e.g.: controller, scheduler etc.
 */
@Injectable()
export class TicketsService {
    private readonly logger = new Logger(TicketsService.name);

    constructor(
        @InjectModel(TICKET_MODEL_NAME) private ticketModel: Model<TicketModel>,
        @InjectModel(COUNTER_MODEL_NAME) private counterModel: Model<CounterModel>,
    ) {
        // Check if auto increment counter needs to be initialized
        counterModel
            .exists({ _id: AUTO_INC_VERIFICATION_CODE })
            .then(exists => {
                this.logger.debug('auto increment counter check: ' + AUTO_INC_VERIFICATION_CODE + ' with result: ' + exists);
                if (!exists) {
                    return new this.counterModel({ _id: AUTO_INC_VERIFICATION_CODE }).save().then(initCounter => {
                        this.logger.log(
                            'initialized auto increment counter for ' + AUTO_INC_VERIFICATION_CODE + ' with ' + initCounter.seq,
                        );
                    });
                } else {
                    return Promise.resolve();
                }
            })
            .catch(e => {
                this.logger.warn('failed to init auto increment counter for ' + AUTO_INC_VERIFICATION_CODE + ' with error: ', e);
            });
    }

    /**
     *Creates a new ticket by given request.
     * @param ticketToCreate the new ticket to create.
     */
    async createTicket(ticketToCreate: TicketRequest): Promise<Result<Ticket, TicketCreationFailure>> {
        try {
            let numberOfTicketsValidTo = await this.ticketModel
                .find({
                    validToDateTime: {
                        $gte: ticketToCreate.validFromDateTime,
                        $lte: ticketToCreate.validToDateTime,
                    },
                    hashedPassportId: ticketToCreate.hashedPassportId,
                })
                .countDocuments();

            let numberOfTicketsValidEnd = await this.ticketModel
                .find({
                    validFromDateTime: {
                        $gte: ticketToCreate.validFromDateTime,
                        $lte: ticketToCreate.validToDateTime,
                    },
                    hashedPassportId: ticketToCreate.hashedPassportId,
                })
                .countDocuments();
            if (numberOfTicketsValidEnd > 0 || numberOfTicketsValidTo > 0) {
                return Promise.resolve(err(new TicketCreationFailure(TicketCreationFailureReason.ConflictInTime)));
            }

            // before ticket create, get a unique code
            const codeNumber = (await this.counterModel.findByIdAndUpdate(
                { _id: AUTO_INC_VERIFICATION_CODE },
                { $inc: { seq: 1 } },
                { new: true, upsert: true },
            )) as CounterModel;
            const codePrefix = randomSpeakableCharGenerator(2);
            const code = codePrefix + codeNumber.seq;
            this.logger.debug('allocated verificationCode: ' + code);

            // enhance ticket request by generated verificationCode
            const enhancedTicket = {
                verificationCode: code,
                ...ticketToCreate,
            };

            const savedTicket: Ticket = await new this.ticketModel(enhancedTicket).save();
            return Promise.resolve(ok(savedTicket));
        } catch (e) {
            //catch every thing and return them
            return Promise.reject(err(new TicketCreationFailure(TicketCreationFailureReason.InternalError, e)));
        }
    }

    /**
     * Search all tickets which belongs to hashed password id.
     * @param searchedHashedPasswordId hashed passwort id to search for tickets
     */
    async retrieveByIdentity(identity: Identity): Promise<Ticket[]> {
        return this.ticketModel.find({
            hashedPassportId: identity.hashedPassportId,
        });
    }
    /**
     *Find one ticket by ticket id.
     * @param searchTicketId the ticket id of the ticket to search
     */
    async findTicket(searchTicketId: string): Promise<Ticket> {
        const foundTicket: Ticket = await this.ticketModel.findOne({
            _id: new ObjectId(searchTicketId),
        });

        return foundTicket;
    }
}
