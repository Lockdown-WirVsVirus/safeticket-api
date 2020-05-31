import * as mongoose from 'mongoose';
import { Meal } from './food.service';

export const Meal_MODEL_NAME = 'Meal';

export interface MealModul extends Meal, mongoose.Document {}

export const mealSchema = new mongoose.Schema(
    {
        type: String,
        ticketId: String,
        numberOfPersons: Number,
        time: Date,
    }
);

// add virtual ticketId;
mealSchema.virtual('ticketId').get(function() {
    return this._id;
});
