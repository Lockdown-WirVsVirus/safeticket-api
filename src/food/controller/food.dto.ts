import { ApiProperty } from '@nestjs/swagger';
import {  IsNotEmpty, MinLength, IsDateString, IsMongoId, Min } from 'class-validator';
import { IMeal } from '../services/food.service';

export class MealRequestDTO implements IMeal{
    @IsMongoId()
    @IsNotEmpty()
    @ApiProperty({ readOnly: true })
    ticketid: string;
    @IsNotEmpty()
    @Min(1)
    @ApiProperty({ readOnly: true })
    numberOfPersons: number;
    @IsNotEmpty()
    @IsDateString()
    @ApiProperty({ readOnly: true })
    time: Date;

}
