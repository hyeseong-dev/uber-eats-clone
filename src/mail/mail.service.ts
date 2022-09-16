import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';
import got from 'got';
import { format } from 'path';

@Injectable()
export class MailService {
    constructor(
        @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions
    ) {
    }

    private async sendEmail(
        subject: string,
        template: string,
        emailVars: EmailVar[]) {
        const form = new FormData()
        form.append('from', `hyeseong from Uber Eats <mailgun@${this.options.domain}>`);
        form.append('to', `kistikaren4859@gmail.com`);
        form.append('subject', subject);
        form.append('template', template);
        emailVars.forEach(eVar => form.append(`v:${eVar.key}`, eVar.value));
        try {
            const response = await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${this.options.apiKey}`,
                    },
                    body: form
                }
            )
            console.log(response.body)
        } catch (error) {
            console.log(error)
        }
    }
    sendVerificationEmail(email: string, code: string) {
        this.sendEmail('Verify your email', 'verify-email', [
            { key: 'code', value: code },
            { key: 'username', value: email },
        ])
    }
}