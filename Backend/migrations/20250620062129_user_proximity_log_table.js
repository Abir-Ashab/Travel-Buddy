export async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  
  await knex.schema.createTable('user_proximity_log', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable();
    table.uuid('target_user_id').nullable();
    table.uuid('location_id').notNullable();
    table.enum('trigger_type', [
      'wishlist_location', 
      'trip_participant', 
      'featured_post'
    ]).notNullable();
    table.decimal('distance_km', 8, 2).nullable();
    table.timestamps(true, true);

    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('target_user_id').references('id').inTable('users').onDelete('CASCADE');
    table.foreign('location_id').references('id').inTable('locations').onDelete('CASCADE');
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('user_proximity_log');
}