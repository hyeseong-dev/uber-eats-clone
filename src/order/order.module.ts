import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { RestaurantService } from '../restaurants/restaurants.service';
import { Order } from './entities/order.entity';
import { OrderResolver } from './orders.resolver';
import { OrderService } from './orders.service';

@Module({
    imports: [TypeOrmModule.forFeature([Order, Restaurant])],
    providers: [OrderService, OrderResolver,]
})
export class OrderModule { }
