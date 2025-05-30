import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table: Knex.TableBuilder) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('role').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.string('status').notNullable().defaultTo('ACTIVE');
    table.timestamp('passwordChangedAt').nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users');
}