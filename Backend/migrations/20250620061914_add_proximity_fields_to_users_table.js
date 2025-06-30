export async function up(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.boolean('proximity_notifications_enabled').defaultTo(true);
    table.integer('proximity_radius_km').defaultTo(50);
    table.decimal('current_latitude', 10, 8).nullable();
    table.decimal('current_longitude', 11, 8).nullable();
    table.timestamp('location_updated_at').nullable();
  });
};

export async function down(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.dropIndex(['current_latitude', 'current_longitude'], 'idx_users_current_location');
    table.dropColumn('proximity_notifications_enabled');
    table.dropColumn('proximity_radius_km');
    table.dropColumn('current_latitude');
    table.dropColumn('current_longitude');
    table.dropColumn('location_updated_at');
  });
};