import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Restrict a resolver/handler to the given roles. Use together with the auth
 * and roles guards, e.g.:
 *   @UseGuards(GqlAuthGuard, RolesGuard)
 *   @Roles(Role.ADMIN)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
