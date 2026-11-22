export const MYSQL_POOL = Symbol('MYSQL_POOL');

/**
 * Backwards-compatible token used by repositories and tests.
 * `DatabaseModule` aliases it to {@link MYSQL_POOL}.
 */
export const DATABASE_POOL = Symbol('DATABASE_POOL');
