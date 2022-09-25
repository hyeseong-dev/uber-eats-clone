import { Field, Float, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Dish } from '../../restaurants/entities/dish.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { CoreEntity } from '../../common/entities/core.entity';

export enum OrderStatus {
    Pending = "Pending",
    Cooking = "Cooking",
    PickedUp = "PickedUp",
    Delivered = "Delivered",
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
    @Field(type => User, { nullable: true })
    @ManyToOne(type => User, user => user.orders, { onDelete: "SET NULL", nullable: true })
    customer?: User;

    @Field(type => User, { nullable: true })
    @ManyToOne(type => User, user => user.rides, { onDelete: 'SET NULL', nullable: true })
    driver?: User;

    @Field(type => Restaurant)
    @ManyToOne(type => Restaurant, restaurant => restaurant.orders, { onDelete: "SET NULL", nullable: true })
    restaurant: Restaurant;

    @Field(type => [Dish])
    @ManyToMany(type => Dish)
    @JoinTable()
    dishes: Dish[];

    @Column()
    @Field(type => Float)
    total: number;

    @Column({ type: 'enum', enum: OrderStatus })
    @Field(type => OrderStatus)
    status: OrderStatus;

}