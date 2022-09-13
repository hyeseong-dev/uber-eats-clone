import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { MailModuleOptions } from './mail.interfaces';
import got from 'got';
import { format } from 'path';

@Injectable()
export class MailService {
    constructor(
        @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions
    ) {
        this.sendEmail('testing', 'test');
    }

    private async sendEmail(subject: string, content: string) {
        const form = new FormData()
        form.append('form', `Excited User <mailgun@${this.options.domain}>`);
        form.append('to', `kistikaren4859@gmail.com`);
        form.append('subject', subject);
        form.append('text', content);
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
    }

}