import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource, DataSourceOptions, getConnection } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Verification } from 'src/users/entities/verification.entity';


jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';

const testUser = {
  email: 'nico@las.com',
  password: '12345',
}

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

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
    const data = {
      query: `
        mutation {
          createAccount(input: {
            email:"${testUser.email}",
            password:"${testUser.password}",
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
    it('should fail if account already exists', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation {
            createAccount(input: {
              email:"${testUser.email}",
              password:"${testUser.password}",
              role:Owner
            }) {
              ok
              error
            }
          }
        `,
        })
        .expect(200)
        .expect(res => {
          expect(res.body.data.createAccount.ok).toBe(false);
          expect(res.body.data.createAccount.error).toBe(
            'There is an user with that email already',
          );
        });
    });
    describe('login', () => {
      it('should login with correct credentials', () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .send({
            query: `
            mutation {
              login(input:{
                email:"${testUser.email}",
                password:"${testUser.password}",
              }) {
                ok
                error
                token
              }
            }
          `,
          })
          .expect(200)
          .expect(res => {
            const {
              body: {
                data: { login },
              },
            } = res;
            expect(login.ok).toBe(true);
            expect(login.error).toBe(null);
            expect(login.token).toEqual(expect.any(String));
            jwtToken = login.token;
          });
      });
      it('should not be able to login with wrong credentials', () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .send({
            query: `
            mutation {
              login(input:{
                email:"${testUser.email}",
                password:"xxx",
              }) {
                ok
                error
                token
              }
            }
          `,
          })
          .expect(200)
          .expect(res => {
            const {
              body: {
                data: { login },
              },
            } = res;
            expect(login.ok).toBe(false);
            expect(login.error).toBe('Wrong password');
            expect(login.token).toBe(null);
          });
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
