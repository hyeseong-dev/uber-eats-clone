import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource, DataSourceOptions, getConnection } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Verification } from 'src/users/entities/verification.entity';

const GRAPHQL_ENDPOINT = '/graphql';

describe('UserModule (e2e)', () => {
  let app: INestApplication;


  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });
  afterAll(async () => {

    const options: DataSourceOptions = {
      type: 'postgres',
      database: 'ubereats_test',
      host: 'localhost',
      port: 5434,
      username: 'postgres',
      password: 'postgres',
      synchronize: true,
      logging: false,
      entities: [User, Verification]
    }
    const dataSource = new DataSource(options);
    await dataSource.initialize();
    await dataSource.driver.connect();
    await dataSource.dropDatabase();
    await dataSource.destroy();
    await app.close();
  });
  describe('createAccount', () => {
    const EMAIL = 'nico@las.com';
    const data = {
      query: `
        mutation {
          createAccount(input: {
            email:"${EMAIL}",
            password:"12345",
            role:Owner
          }) {
            ok
            error
          }
        }
        `,
    }
    it('should create account', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send(data)
        .expect(200).expect(res => {
          expect(res.body.data.createAccount.ok).toBe(true);
          expect(res.body.data.createAccount.error).toBe(null);
        });
    });
    it.todo('me')
    it.todo('UserProfile')
    it.todo('createAccount')
    it.todo('login ')
    it.todo('editProfile ')
    it.todo('verifyEmail')
  });
})
