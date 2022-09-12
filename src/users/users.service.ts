import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '../jwt/jwt.service';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
        @InjectRepository(Verification) private readonly verifications: Repository<Verification>,
        private readonly config: ConfigService,
        private readonly jwtService: JwtService,
    ) { }

    async createAccount({ email, password, role }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
        try {
            const exists = await this.users.findOne({ where: { email } });
            if (exists) { return { ok: false, error: 'There is an user with that email already' } }
            // await this.users.save(this.users.create({ email, password, role }));
            const user = await this.users.save(this.users.create({ email, password, role }));
            await this.verifications.save(this.verifications.create({ user }))
            return { ok: true }
        } catch (e) {
            //make error
            return { ok: true, error: "Could't create account" }
        }
    }

    async login({ email, password }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
        // make a JWT and give it to the user 
        try {
            const user = await this.users.findOne({ where: { email } });
            if (!user) { return { ok: false, error: 'User not found' }; }
            const passwordCorrect = await user.checkPassword(password);
            if (!passwordCorrect) { return { ok: false, error: 'Wrong password' }; }
            const token = this.jwtService.sign(user.id)
            return { ok: true, token: token };
        } catch (error) {
            return { ok: false, error }
        }
    }

    async findById(id: number): Promise<User> {
        return this.users.findOne({ where: { id } });
    }
    async editProfile(
        userId: number,
        { email, password }: EditProfileInput
    ): Promise<User> {
        // return this.users.update(userId, { ...editProfileInput });
        const user = await this.users.findOne({ where: { id: userId } });
        if (email) {
            user.email = email;
            user.verified = false;
            await this.verifications.save(this.verifications.create({ user }));
        }
        if (password) { user.password = password; }
        return this.users.save(user);
    }
    async verfyEmail(code: string): Promise<boolean> {
        const verification = await this.verifications.findOne(
            { relations: ['users'], where: { code } }
        )
        if (verification) {
            verification.user.verified = true;
            this.users.save(verification.user);
        }
        return false;
    }
}