import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { err, ok, Result } from 'neverthrow';
import { Meal_MODEL_NAME, MealModul } from './food.schema';
import { TicketModel } from './../../ticketing/services/tickets.schema';
import { TicketCreationFailure, TicketCreationFailureReason } from './../../ticketing/services/tickets.service';

export class Meal {
    ticketid: string;
    numberOfPersons: number;
    time: Date;
}

export class MealRequest {
    ticketid: string;
    numberOfPersons: number;
    time: Date;
}

export interface IMeal extends Meal {
    ticketid: string;
    numberOfPersons: number;
    time: Date;
}

@Injectable()
export class FoodService {
    constructor(@InjectModel(Meal_MODEL_NAME) private mealModul: Model<MealModul>, private ticketModul: Model<TicketModel>) {}

    async requestFood(meal: MealRequest): Promise<Result<Meal, TicketCreationFailure>> {
        try {
            let numberOfTickets = await this.ticketModul
                .find({
                    ticketId: meal.ticketid,
                })
                .count();

            if (numberOfTickets < 0) {
                return Promise.resolve(err(new TicketCreationFailure(TicketCreationFailureReason.ConflictInTime)));
            }
            const savedMeal = await new this.mealModul(meal).save();
            return Promise.resolve(ok(savedMeal));
        } catch (e) {
            return Promise.reject(err(new TicketCreationFailure(TicketCreationFailureReason.InternalError, e)));
        }
    }
}
