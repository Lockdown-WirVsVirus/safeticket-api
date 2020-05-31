import { Controller, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FoodService } from '../services/food.service';


@ApiTags('food')
@Controller('api/v1/food')
export class FoodController {
    private readonly logger = new Logger(FoodController.name);

    constructor(private readonly foodService: FoodService) {}

}
