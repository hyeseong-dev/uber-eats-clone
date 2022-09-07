import { CoreEntity } from '../../common/entities/core.entity';
import { Column, Entity } from 'typeorm';
import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';

enum UserRole { Client, Owner, Delivery }

registerEnumType(UserRole, { name: 'UserRole' })

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

    @Column({ type: 'enum', enum: UserRole })
    @Field(type => UserRole)
    role: UserRole;
}