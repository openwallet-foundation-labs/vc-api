import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * Inspired by https://dev.to/webeleon/unit-testing-nestjs-with-typeorm-in-memory-l6m
 */
export const TypeOrmSQLiteModule = () =>
  TypeOrmModule.forRoot({
    type: 'better-sqlite3',
    database: ':memory:',
    dropSchema: true,
    autoLoadEntities: true, // https://docs.nestjs.com/techniques/database#auto-load-entities
    synchronize: true,
    keepConnectionAlive: true // https://github.com/nestjs/typeorm/issues/61
  });
