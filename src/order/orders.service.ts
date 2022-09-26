import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from '../restaurants/entities/dish.entity';

export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orders: Repository<Order>,
        @InjectRepository(OrderItem)
        private readonly orderItems: Repository<OrderItem>,
        @InjectRepository(Restaurant)
        private readonly restaurant: Repository<Restaurant>,
        @InjectRepository(Dish)
        private readonly dishes: Repository<Dish>,

    ) { }

    async createOrder(
        customer: User,
        { restaurantId, items }: CreateOrderInput,
    ): Promise<CreateOrderOutput> {
        const restaurant = await this.restaurant.findOne({ where: { id: restaurantId } })
        if (!restaurant) return { ok: false, error: 'Restaurant not found' }
        const order = await this.orders.save(this.orders.create({ customer, restaurant }))
        items.forEach(async item => {
            const dish = await this.dishes.findOne({ where: { id: item.dishId } })
            if (!dish) return {}
            await this.orderItems.save(
                this.orderItems.create({
                    dish,
                    options: item.options
                })
            );
        })

    }


}