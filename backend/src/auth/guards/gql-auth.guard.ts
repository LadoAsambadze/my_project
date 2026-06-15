import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

/**
 * Passport's AuthGuard reads the request from an HTTP context by default.
 * For GraphQL we must pull the request out of the GraphQL execution context.
 */
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt-access') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
