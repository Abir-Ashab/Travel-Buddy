export async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await knex.raw('CREATE EXTENSION IF NOT EXISTS postgis');

  await knex.schema.createTable('proximity_settings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').unique();
    table.decimal('proximity_radius_km', 8, 2).defaultTo(5.0);
    table.boolean('enable_wishlist_alerts').defaultTo(true);
    table.boolean('enable_trip_participant_alerts').defaultTo(true);
    table.boolean('enable_featured_post_alerts').defaultTo(true);
    table.boolean('enable_attraction_alerts').defaultTo(true);
    table.boolean('enable_accommodation_alerts').defaultTo(true);
    table.boolean('enable_dining_alerts').defaultTo(true);
    table.timestamps(true, true);
  });

  const hasCurrentLatitude = await knex.schema.hasColumn('users', 'current_latitude');
  const hasCurrentLongitude = await knex.schema.hasColumn('users', 'current_longitude');
  
  if (!hasCurrentLatitude || !hasCurrentLongitude) {
    await knex.schema.alterTable('users', (table) => {
      if (!hasCurrentLatitude) {
        table.decimal('current_latitude', 10, 8).nullable();
      }
      if (!hasCurrentLongitude) {
        table.decimal('current_longitude', 11, 8).nullable();
      }
      table.timestamp('location_updated_at').nullable();
    });
  }

  await knex.raw(`CREATE INDEX IF NOT EXISTS idx_users_current_location ON users USING GIST (geom)`);
  await knex.raw(`CREATE INDEX IF NOT EXISTS idx_locations_geom ON locations USING GIST (geom)`);
  
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_user_geom()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.current_latitude IS NOT NULL AND NEW.current_longitude IS NOT NULL THEN
        NEW.geom = ST_SetSRID(ST_MakePoint(NEW.current_longitude, NEW.current_latitude), 4326);
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await knex.raw(`
    DROP TRIGGER IF EXISTS trigger_update_user_geom ON users;
    CREATE TRIGGER trigger_update_user_geom
      BEFORE INSERT OR UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_user_geom();
  `);

  await knex.raw(`
    UPDATE users
    SET geom = ST_SetSRID(ST_MakePoint(current_longitude, current_latitude), 4326)
    WHERE current_latitude IS NOT NULL AND current_longitude IS NOT NULL;
  `);
}

export async function down(knex) {
  await knex.raw(`DROP TRIGGER IF EXISTS trigger_update_user_geom ON users`);
  await knex.raw(`DROP FUNCTION IF EXISTS update_user_geom()`);
  await knex.raw(`DROP INDEX IF EXISTS idx_users_current_location`);
  await knex.raw(`DROP INDEX IF EXISTS idx_locations_geom`);
  
  await knex.schema.dropTableIfExists('proximity_settings');
  
  const hasCurrentLatitude = await knex.schema.hasColumn('users', 'current_latitude');
  const hasCurrentLongitude = await knex.schema.hasColumn('users', 'current_longitude');
  const hasLocationUpdatedAt = await knex.schema.hasColumn('users', 'location_updated_at');
  
  if (hasCurrentLatitude || hasCurrentLongitude || hasLocationUpdatedAt) {
    await knex.schema.alterTable('users', (table) => {
      if (hasCurrentLatitude) table.dropColumn('current_latitude');
      if (hasCurrentLongitude) table.dropColumn('current_longitude');
      if (hasLocationUpdatedAt) table.dropColumn('location_updated_at');
    });
  }
}