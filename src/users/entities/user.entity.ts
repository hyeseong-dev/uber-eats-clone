import { CoreEntity } from '../../common/entities/core.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { InternalServerErrorException } from '@nestjs/common';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

enum UserRole { Client, Owner, Delivery }

registerEnumType(UserRole, { name: 'UserRole' })

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
    @Column({ unique: true })
    @Field(typpe => String)
    @IsEmail()
    email: string;

    @Column({ select: false })
    @Field(typpe => String)
    @IsString()
    password: string;

    @Column({ type: 'enum', enum: UserRole })
    @Field(type => UserRole)
    @IsEnum(UserRole)
    role: UserRole;

    @Field(type => Boolean)
    @Column({ default: false })
    @IsBoolean()
    verified: boolean;

    @Field(type => [Restaurant])
    @OneToMany(type => Restaurant, restaurant => restaurant.owner)
    restaurants: Restaurant[];

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(): Promise<void> {
        if (this.password) {
            try {
                this.password = await bcrypt.hash(this.password, 10);
            } catch (e) {
                console.log(e);
                throw new InternalServerErrorException();
            }
        }
    }

    async checkPassword(aPassword: string): Promise<boolean> {
        try {
            const ok = await bcrypt.compare(aPassword, this.password);
            return ok
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException();
        }
    }
}