import { TypeOrmModule } from '@nestjs/typeorm';
import { EthrDID } from '@energyweb/ssi-did';
import { KeyPair } from './key/key-pair.entity';

/**
 * Inspired by https://dev.to/webeleon/unit-testing-nestjs-with-typeorm-in-memory-l6m
 */
export const TypeOrmSQLiteModule = () => [
  TypeOrmModule.forRoot({
    type: 'better-sqlite3',
    database: ':memory:',
    dropSchema: true,
    entities: [EthrDID, KeyPair],
    synchronize: true,
    keepConnectionAlive: true // https://github.com/nestjs/typeorm/issues/61
  }),
  TypeOrmModule.forFeature([EthrDID, KeyPair])
];
