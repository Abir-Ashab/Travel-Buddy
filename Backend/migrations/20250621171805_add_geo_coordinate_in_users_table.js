export async function up(knex) {
  await knex.raw(`CREATE EXTENSION IF NOT EXISTS postgis`);
  await knex.schema.alterTable('users', (table) => {
    table.specificType('geom', 'geometry(Point, 4326)').nullable();
  });
  await knex.raw(`
    UPDATE users
    SET geom = ST_SetSRID(ST_MakePoint(current_longitude, current_latitude), 4326)
    WHERE current_latitude IS NOT NULL AND current_longitude IS NOT NULL;
  `);
  await knex.raw(`CREATE INDEX IF NOT EXISTS idx_users_geom ON users USING GIST (geom)`);
}

export async function down(knex) {
  await knex.raw(`DROP INDEX IF EXISTS idx_users_geom`);

  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('geom');
  });
}
