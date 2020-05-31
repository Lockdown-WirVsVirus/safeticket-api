import { Controller, Logger, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FoodService, MealRequest, Meal } from '../services/food.service';
import { TicketCreationFailureReason } from 'src/ticketing/services/tickets.service';


@ApiTags('food')
@Controller('api/v1/food')
export class FoodController {
    private readonly logger = new Logger(FoodController.name);

    constructor(private readonly foodService: FoodService) {}

    async requestFood(@Body() meal: MealRequest): Promise<Meal>{

        const createdFoodRequest = await this.foodService.requestFood(meal);

        return new Promise((resolve, rect) =>{
            createdFoodRequest.mapErr(foodCreateFailure =>{
                switch( foodCreateFailure.reason){
                    case TicketCreationFailureReason.ConflictInTime:
                        return rect(new HttpException('Ticket dont exsist in ticket database', HttpStatus.CONFLICT))
                    default:
                            this.logger.error('Failure during creation:' + foodCreateFailure?.error);
                            return rect(new HttpException('Failure during creation of ticket', HttpStatus.INTERNAL_SERVER_ERROR));
                }
            })
        .map((createdFoodRequest) =>{
            resolve(this.mapToDTO(createdFoodRequest))
        })
        })
    }

    mapToDTO(meal: MealRequest): Meal{
        return {
            time: meal.time,
            ticketid: meal.ticketid,
            numberOfPersons: meal.numberOfPersons
        }
    }

}
