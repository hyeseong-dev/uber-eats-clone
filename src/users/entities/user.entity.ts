import { CoreEntity } from '../../common/entities/core.entity';
import { Column, Entity } from 'typeorm';
import { Field, InputType, ObjectType } from '@nestjs/graphql';

type UserRole = 'client' | 'owner' | 'delivery';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
    @Column()
    @Field(typpe => String)
    email: string;

    @Column()
    @Field(typpe => String)
    password: string;

    @Column()
    @Field(typpe => String)
    role: UserRole;
}