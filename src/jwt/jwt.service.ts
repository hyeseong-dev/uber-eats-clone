import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { sign } from 'crypto';
// import { CONFIG_OPTIONS } from './jwt.constants';
import { JwtModuleOptions } from './jwt.interface';
import { CONFIG_OPTIONS } from '../common/common.constants';

@Injectable()
export class JwtService {
    constructor(
        @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions
    ) { }
    sign(userId: number): string {
        return jwt.sign({ id: userId }, this.options.privateKey);
    }
    verify(token: string) {
        return jwt.verify(token, this.options.privateKey);
    }
}