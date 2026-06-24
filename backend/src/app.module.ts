import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { PagesModule } from './pages/pages.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      // Expose Express req/res to resolvers (needed for refresh-token cookies).
      context: ({ req, res }: { req: unknown; res: unknown }) => ({ req, res }),
      // Introspection + the embedded Apollo Sandbox give a "Swagger-style"
      // explorer at http://localhost:4000/graphql (open it in a browser):
      // browse the schema, read docs, and run queries/mutations interactively.
      // `playground: false` stops the driver adding its own landing page so the
      // Sandbox plugin below is the only one (Apollo allows just one).
      introspection: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
    }),
    PrismaModule,
    AuthModule,
    PagesModule,
    PostsModule,
  ],
})
export class AppModule {}
