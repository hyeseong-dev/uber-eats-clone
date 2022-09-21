import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource, DataSourceOptions, getConnection, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Verification } from 'src/users/entities/verification.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { number } from 'joi';


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
  let userRepository: Repository<User>;
  let jwtToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
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
            const { login } = res.body.data;
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
            const { login } = res.body.data;
            expect(login.ok).toBe(false);
            expect(login.error).toBe('Wrong password');
            expect(login.token).toBe(null);
          });
      });
    });
    describe('userProfile', () => {
      let userId; number;
      beforeAll(async () => {
        const [user] = await userRepository.find();
        userId = user.id;
      });
      it("should see a user's profile", () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .set('X-JWT', jwtToken)
          .send({
            query: `
          {
            userProfile(userId: ${userId}){
              ok
              error
              user {
                id
              }
            }
          }`})
          .expect(200)
          .expect(res => {
            const { ok, error, user: { id } } = res.body.data.userProfile;
            expect(ok).toBe(true);
            expect(error).toBe(null);
            expect(id).toBe(userId);
          });
      })
      it('should not find a profile', () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .set('X-JWT', jwtToken)
          .send({
            query: `
            {
              userProfile(userId:666){
                ok
                error
                user {
                  id
                }
              }
            }`
          })
          .expect(200)
          .expect(res => {
            const { ok, error, user } = res.body.data.userProfile;
            expect(ok).toBe(false);
            expect(error).toBe('User Not Found');
            expect(user).toBe(null);
          })
      })
    })
    describe('me', () => {
      it('should find my profile', () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .set('X-JWT', jwtToken)
          .send({
            query: `
            {
              me {
                email
              }
            }
            `
          })
          .expect(200)
          .expect(res => {
            const email = res.body.data.me.email;
            expect(email).toBe(testUser.email);
          })
      })
      it('should not allow logged out user', () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .send({
            query: `
            {
              me {
                email
              }
            }
            `
          })
          .expect(200)
          .expect(res => {
            const [error] = res.body.errors;
            expect(error.message).toBe('Forbidden resource');
          })
      })
    })
    describe('editProfile', () => {
      const NEW_EMAIL = 'nico@new.com';
      it('should change email', () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .set('X-JWT', jwtToken)
          .send({
            query: `
              mutation {
                editProfile(input: {
                  email: "${NEW_EMAIL}",
                }){
                  ok
                  error
                }
              }
            `
          })
          .expect(200)
          .expect(res => {
            const { ok, error } = res.body.data.editProfile
            expect(ok).toBe(true);
            expect(error).toBe(null);
          })
      })
      it('should have new email', () => {
        return request(app.getHttpServer())
          .post(GRAPHQL_ENDPOINT)
          .set('X-JWT', jwtToken)
          .send({
            query: `
            {
             me {
                  email 
                }
            }
            `
          })
          .expect(200)
          .expect(res => {
            const email = res.body.data.me.email;
            expect(email).toBe(NEW_EMAIL);
          })
      })
    })
    it.todo('verifyEmail')
  });
})
