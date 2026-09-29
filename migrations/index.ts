import * as migration_20260929_185038_initial from './20260929_185038_initial';
import * as migration_20260929_190000_reader_auth from './20260929_190000_reader_auth';

export const migrations = [
  {
    up: migration_20260929_185038_initial.up,
    down: migration_20260929_185038_initial.down,
    name: '20260929_185038_initial',
  },
  {
    up: migration_20260929_190000_reader_auth.up,
    down: migration_20260929_190000_reader_auth.down,
    name: '20260929_190000_reader_auth'
  },
];
