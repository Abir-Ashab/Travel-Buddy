export async function up(knex) {
  await knex.schema.createTable('service_cache', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('location_id').references('id').inTable('locations').onDelete('CASCADE');
    table.enum('service_type', ['hotel', 'transport', 'restaurant', 'attractions']).notNullable();
    table.json('cached_data').notNullable();
    table.timestamp('cached_at').defaultTo(knex.fn.now());
    table.timestamp('expires_at').notNullable();
    table.string('cache_key').notNullable();
  });

  await knex.schema.createTable('user_service_bookmarks', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('service_name').notNullable();
    table.enum('service_type', ['hotel', 'restaurant', 'transport']).notNullable();
    table.uuid('location_id').references('id').inTable('locations').onDelete('CASCADE');
    table.json('service_details').notNullable();
    table.string('external_service_id').nullable();
    table.boolean('is_visited').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('message').notNullable();
    table.enum('type', ['like', 'save', 'trip_invite', 'match_found', 'wishlist_share']).notNullable();
    table.json('metadata').nullable();
    table.boolean('is_read').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.dropTableIfExists('user_service_bookmarks');
  await knex.schema.dropTableIfExists('service_cache');
}
