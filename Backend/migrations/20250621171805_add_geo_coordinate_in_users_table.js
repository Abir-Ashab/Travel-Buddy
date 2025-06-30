export async function up(knex) {
  // Ensure PostGIS extension is enabled
  await knex.raw(`CREATE EXTENSION IF NOT EXISTS postgis`);

  // Add geometry column to users table
  await knex.schema.alterTable('users', (table) => {
    table.specificType('geom', 'geometry(Point, 4326)').nullable();
  });

  // Populate geom field from current_latitude and current_longitude
  await knex.raw(`
    UPDATE users
    SET geom = ST_SetSRID(ST_MakePoint(current_longitude, current_latitude), 4326)
    WHERE current_latitude IS NOT NULL AND current_longitude IS NOT NULL;
  `);

  // Create GIST index on geom for spatial queries
  await knex.raw(`CREATE INDEX IF NOT EXISTS idx_users_geom ON users USING GIST (geom)`);
}

export async function down(knex) {
  // Drop the index and column
  await knex.raw(`DROP INDEX IF EXISTS idx_users_geom`);

  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('geom');
  });
}
