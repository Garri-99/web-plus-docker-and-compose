import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthUser = createParamDecorator(
  (data: never, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().user;
  },
);
