import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';

export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orders: Repository<Order>
    ) { }
}