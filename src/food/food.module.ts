import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {Meal_MODEL_NAME, mealSchema} from './services/food.schema'
import {FoodService} from './services/food.service'
import {FoodController} from './controller/food.controller'



@Module({
    imports: [MongooseModule.forFeature([{ name: Meal_MODEL_NAME, schema: mealSchema }])],
    controllers: [FoodController],
    providers: [FoodService],
    exports: [FoodService],
})
export class TicketingModule {}
