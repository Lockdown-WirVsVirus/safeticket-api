import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';

@Injectable()
export class JwtGuard implements CanActivate {
    private readonly logger = new Logger(JwtGuard.name);

    constructor(private readonly authService: AuthService) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();

        const authorization = request.get('Authorization');
        if (!authorization) {
            throw new UnauthorizedException();
        }
        const token = authorization.replace('Bearer ', '');

        const booleanPromise = this.authService
            .verifyToken(token)
            .then(verifiedJwt => {
                // put user into request in further middleware chain
                request.user = verifiedJwt;
                return true;
            })
            .catch(err => {
                this.logger.debug(
                    'jwt verification failed with: ' +
                        JSON.stringify({
                            err,
                            token,
                        }),
                );
                return false;
            });

        // Note that behind the scenes, when a guard returns false, the framework throws a ForbiddenException.
        // If you want to return a different error response, you should throw your own specific exception.
        // For example: throw new UnauthorizedException();
        return booleanPromise;
    }
}
