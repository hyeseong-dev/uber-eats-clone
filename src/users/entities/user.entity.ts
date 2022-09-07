import { CoreEntity } from '../../common/entities/core.entity';
import { BeforeInsert, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { InternalServerErrorException } from '@nestjs/common';

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

    @BeforeInsert()
    async hashPassword(): Promise<void> {
        try {
            this.password = await bcrypt.hash(this.password, 10);
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException();
        }
    }
}