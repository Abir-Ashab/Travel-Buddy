export const up = async (knex) => {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.enum('role', Object.values(USER_Role)).notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.enum('status', Object.values(USER_STATUS)).notNullable().defaultTo(USER_STATUS.ACTIVE);
    table.timestamp('password_changed_at').nullable();
    table.timestamps(true, true); // created_at, updated_at
  });
};

export const down = async (knex) => {
  return knex.schema.dropTable('users');
};
