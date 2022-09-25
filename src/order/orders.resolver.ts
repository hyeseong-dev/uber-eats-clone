import { Args, ArgsType, Mutation, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../auth/auth-user.decorator';
import { Role } from '../auth/role.decorator';
import { User } from '../users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';

@Resolver(of => Order)
export class OrderResolver {
    constructor(private readonly orderService: OrderService) { }

    @Mutation(returns => CreateOrderOutput)
    @Role(['Client'])
    async createOrder(
        @AuthUser() customer: User,
        @Args('input') createOrderInput: CreateOrderInput
    ): Promise<CreateOrderOutput> {
        return { ok: true }
    }

}