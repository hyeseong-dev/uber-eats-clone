import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';

console.log('*'.repeat(30))
console.log(process.env.NODE_ENV !== 'prod')
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? './src/envs/.env.dev' : '.src/envs/.env.test',
      ignoreEnvFile: process.env.NODE_ENV === '.src/envs/.env.prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        DB_SYNCHRONIZE: Joi.string().required(),
        DB_LOGGING: Joi.string().required(),
      })
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: + (process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== 'prod',
      logging: Boolean(process.env.DB_LOGGING),
      entities: [Restaurant],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
    CommonModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }



