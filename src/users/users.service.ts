import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput, CreateAccountOutput } from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '../jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
        @InjectRepository(Verification)
        private readonly verifications: Repository<Verification>,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService
    ) { }

    async createAccount({ email, password, role }: CreateAccountInput): Promise<CreateAccountOutput> {
        try {
            const exists = await this.users.findOne({ where: { email } });
            if (exists) { return { ok: false, error: 'There is an user with that email already' } }
            const user = await this.users.save(this.users.create({ email, password, role }));
            const verification = await this.verifications.save(this.verifications.create({ user }))
            // this.mailService.sendVerificationEmail(user.email, verification.code);
            return { ok: true }
        } catch (e) {
            //make error
            return { ok: true, error: "Could't create account" }
        }
    }

    async login({ email, password }: LoginInput): Promise<LoginOutput> {
        // make a JWT and give it to the user 
        try {
            const user = await this.users.findOne({ where: { email }, select: ['password', 'id'] });
            if (!user) { return { ok: false, error: 'User not found' }; }
            const passwordCorrect = await user.checkPassword(password);
            if (!passwordCorrect) { return { ok: false, error: 'Wrong password' }; }
            const token = this.jwtService.sign(user.id)
            return { ok: true, token: token };
        } catch (error) {
            return { ok: false, error }
        }
    }

    async findById(id: number): Promise<UserProfileOutput> {
        try {
            const user = await this.users.findOne({
                where: { id },
                // select: ['email', 'password', 'role', 'verified', 'role', 'createdAt', 'updatedAt']
            });
            if (user) { return { ok: true, user } };
        } catch (error) {
            return { ok: false, error: "User Not Found" };
        }
    }

    async editProfile(
        userId: number,
        { email, password }: EditProfileInput
    ): Promise<EditProfileOutput> {
        try {
            const user = await this.users.findOne({ where: { id: userId } });
            if (email) {
                user.email = email;
                user.verified = false;
                const verification = await this.verifications.save(this.verifications.create({ user }))
            }
            // this.mailService.sendVerificationEmail(user.email, verification.code);
        } catch (error) {
            return { ok: false, error: "Could not update profile." }
        }
    }
    async verfyEmail(code: string): Promise<VerifyEmailOutput> {
        try {
            const verification = await this.verifications.findOne({
                where: { code },
                relations: ['user'],
            });
            if (verification) {
                verification.user.verified = true;
                this.users.save(verification.user);
                return { ok: true }
            }
            throw new Error();
        } catch (error) {
            return { ok: false, error };
        }
    }
}