import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HashingService } from '../../crypto/services/hashing.service';
import { TicketsService, TicketCreationFailureReason } from '../services/tickets.service';
import { IdentityDto, TicketRequestDto, TicketResponseDto } from './tickets.dto';

@ApiTags('ticket')
@Controller('api/v1/tickets')
export class TicketsController {
    private readonly logger = new Logger(TicketsController.name);

    constructor(private readonly ticketsService: TicketsService, private readonly hashingService: HashingService) {}

    @Post()
    async createTicket(@Body() ticketDto: TicketRequestDto): Promise<TicketResponseDto> {
        const createdTicketResult = await this.ticketsService.createTicket({
            hashedPassportId: await this.hashingService.hashPassportId(ticketDto.passportId),
            reason: ticketDto.reason,
            startAddress: ticketDto.startAddress,
            endAddress: ticketDto.endAddress,
            validFromDateTime: ticketDto.validFromDateTime,
            validToDateTime: ticketDto.validToDateTime,
        });

        return new Promise((resolve, reject) => {
            createdTicketResult
                .mapErr(ticketCreationFailure => {
                    switch (ticketCreationFailure.reason) {
                        case TicketCreationFailureReason.ConflictInTime:
                            return reject(new HttpException('Ticket conflicts in same time for other ticket', HttpStatus.CONFLICT));
                        default:
                            this.logger.error('Failure during creation:' + ticketCreationFailure?.error);
                            return reject(new HttpException('Failure during creation of ticket', HttpStatus.INTERNAL_SERVER_ERROR));
                    }
                })
                .map(successfullyCreatedTicket => {
                    this.logger.log(`Created new ticket: ${successfullyCreatedTicket.ticketId}`);
                    resolve({
                        ticketId: successfullyCreatedTicket.ticketId,
                        ticketStatus: successfullyCreatedTicket.ticketStatus,
                        validFromDateTime: successfullyCreatedTicket.validFromDateTime,
                        validToDateTime: successfullyCreatedTicket.validToDateTime,
                        hashedPassportId: successfullyCreatedTicket.hashedPassportId,
                        reason: successfullyCreatedTicket.reason,
                        startAddress: successfullyCreatedTicket.startAddress,
                        endAddress: successfullyCreatedTicket.endAddress,
                    });
                });
        });
    }

    @Get(':ticketId')
    async getTicket(@Param('ticketId') ticketId: string): Promise<TicketResponseDto> {
        const foundTicket: TicketResponseDto = await this.ticketsService.findTicket(ticketId);

        if (!foundTicket) {
            throw new HttpException('Ticket not Found', HttpStatus.NOT_FOUND);
        }

        return foundTicket;
    }

    @HttpCode(200)
    @Post('/for/identity')
    async retrieveTicketsForIdentity(@Body() identity: IdentityDto): Promise<TicketResponseDto[]> {
        const ticketsOfIdentity: TicketResponseDto[] = await this.ticketsService.retrieveByIdentity(identity);

        if (!ticketsOfIdentity) {
            // return array if not found by ticket service
            return [];
        }

        return ticketsOfIdentity;
    }
}
