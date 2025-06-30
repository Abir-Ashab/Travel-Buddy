export async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');  // UUID extension
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.enum('role', ['explorer', 'traveler', 'admin', 'super_admin']).defaultTo('explorer');
    table.string('email').unique().notNullable();
    table.string('number').nullable();
    table.string('password').notNullable();
    table.enum('status', ['active', 'blocked']).defaultTo('active');
    table.text('bio').nullable();
    table.json('travel_preferences').nullable();
    table.string('profile_picture').nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('refresh_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('token').notNullable().unique();
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('locations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.string('country').notNullable();
    table.string('region').notNullable();
    table.decimal('latitude', 10, 8).notNullable();
    table.decimal('longitude', 11, 8).notNullable();
    table.string('timezone').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('locations');
  await knex.schema.dropTableIfExists('users');
  await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
}
