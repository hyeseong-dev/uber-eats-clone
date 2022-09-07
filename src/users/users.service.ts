import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
    ) { }

    async createAccount({ email, password, role }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
        try {
            const exists = await this.users.findOne({ where: { email } });
            if (exists) {
                // make error
                return { ok: false, error: 'There is an user with that email already' }
            }
            await this.users.save(this.users.create({ email, password, role }));
            return { ok: true }
        } catch (e) {
            //make error
            return { ok: true, error: "Could't create account" }
        }
    }
}