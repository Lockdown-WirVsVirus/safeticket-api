import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * a decorator as shortcut to get the user embedded from http request
 * to use it in a controller, just add @User to the controller function parameter
 *
 * example:
 * @Get('test')
 * @UseGuards(JwtGuard)
 *  testAuth(@User() user: IJwtTokenPayload) {
 *      user.hashedPassportId
 *  }
 *
 * see JwtGuard
 */
export const User = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});
