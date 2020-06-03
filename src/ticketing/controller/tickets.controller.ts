import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, Logger, Header, Res, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HashingService } from '../../crypto/services/hashing.service';
import { TicketsService, TicketCreationFailureReason, Ticket, TicketCreationFailure, TicketID } from '../services/tickets.service';
import { IdentityDto, TicketRequestDto, TicketResponseDto, PDFRequestDTO, TicketRequestID } from './tickets.dto';
import { Result } from 'neverthrow';
import { Readable } from 'stream';

@ApiTags('ticket')
@Controller('api/v1/tickets')
export class TicketsController {
    private readonly logger = new Logger(TicketsController.name);

    constructor(private readonly ticketsService: TicketsService, private readonly hashingService: HashingService) {}

    @Post()
    async createTicket(@Body() ticketDto: TicketRequestDto): Promise<TicketResponseDto> {
        const createdTicketResult: Result<Ticket, TicketCreationFailure> = await this.ticketsService.createTicket({
            hashedPassportId: await this.hashingService.hashPassportId(ticketDto.passportId),
            reason: ticketDto.reason,
            startAddress: ticketDto.startAddress,
            endAddress: ticketDto.endAddress,
            validFromDateTime: ticketDto.validFromDateTime,
            validToDateTime: ticketDto.validToDateTime,
            status: 'CREATED',
        });

        //wrap result handling into promise
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
                    resolve(this.mapToDto(successfullyCreatedTicket));
                });
        });
    }

    @Get(':ticketId')
    async getTicket(@Param() ticketId: TicketRequestID): Promise<TicketResponseDto> {
        const foundTicket: TicketResponseDto = await this.ticketsService.findTicket(ticketId.ticketId);

        if (!foundTicket) {
            throw new HttpException('Ticket not Found', HttpStatus.NOT_FOUND);
        }

        return this.mapToDto(foundTicket);
    }

    @HttpCode(200)
    @Post('/for/identity')
    async retrieveTicketsForIdentity(@Body() identity: IdentityDto): Promise<TicketResponseDto[]> {
        const ticketsOfIdentity: Ticket[] = await this.ticketsService.retrieveByIdentity(identity);

        if (!ticketsOfIdentity) {
            // return array if not found by ticket service
            return [];
        }

        return ticketsOfIdentity.map(ticket => this.mapToDto(ticket));
    }

    @HttpCode(200)
    @Header('Content-Type', 'application/pdf')
    // @Header('Content-Disposition', 'attachment; filename=test.pdf')
    @Header('Content-Disposition', 'attachment')
    @Post(':ticketId/pdf')
    async generatePDF(@Param() ticketId: TicketRequestID, @Res() response, @Body() name?: PDFRequestDTO) {
        const buffer = await this.ticketsService.generateTicketPDF(ticketId.ticketId, name);

        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);
        stream.pipe(response);
    }

    /**
     * Maps internal ticket representation to external dto representation.
     * Other with some information of internal ticket representation will be leaked to external resources.
     * @param ticket the internal representation of an ticket
     */
    private mapToDto(ticket: Ticket): TicketResponseDto {
        return {
            ticketId: ticket.ticketId,
            verificationCode: ticket.verificationCode,
            ticketStatus: ticket.ticketStatus,
            validFromDateTime: ticket.validFromDateTime,
            validToDateTime: ticket.validToDateTime,
            hashedPassportId: ticket.hashedPassportId,
            reason: ticket.reason,
            startAddress: ticket.startAddress,
            endAddress: ticket.endAddress,
            status: ticket.status,
        };
    }

    @HttpCode(204)
    @Delete(':ticketID')
    async invalidTicketById(@Param('ticketID') ticketID: string): Promise<Boolean> {
        return this.ticketsService.invalidTicketByID(ticketID);
    }
}
