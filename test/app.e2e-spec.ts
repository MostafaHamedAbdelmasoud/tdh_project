import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('ChatController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/rooms (GET) should return an array', async () => {
    const res = await request(app.getHttpServer()).get('/rooms').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/users (GET) should return an array', async () => {
    const res = await request(app.getHttpServer()).get('/users').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
