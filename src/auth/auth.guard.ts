import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const gqlContext = GqlExecutionContext.create(context).getContext();
        const user = gqlContext['user'];
        if (!user) {
            return false;
        }
        console.log(user)
        return true;
    }
}