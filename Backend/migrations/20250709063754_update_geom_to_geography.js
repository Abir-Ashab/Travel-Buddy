export async function up(knex) {
  await knex.raw(`CREATE EXTENSION IF NOT EXISTS postgis`);

  await knex.raw(`DROP INDEX IF EXISTS idx_users_geom`);
  const hasUserGeom = await knex.schema.hasColumn('users', 'geom');
  if (hasUserGeom) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('geom');
    });
  }

  await knex.schema.alterTable('users', (table) => {
    table.specificType('geom', 'geography(Point, 4326)').nullable();
  });

  await knex.raw(`
    UPDATE users
    SET geom = ST_SetSRID(ST_MakePoint(current_longitude, current_latitude), 4326)::geography
    WHERE current_latitude IS NOT NULL AND current_longitude IS NOT NULL;
  `);

  await knex.raw(`CREATE INDEX IF NOT EXISTS idx_users_geom ON users USING GIST (geom)`);
  await knex.raw(`DROP INDEX IF EXISTS idx_locations_geom`);

  const hasLocationGeom = await knex.schema.hasColumn('locations', 'geom');
  if (hasLocationGeom) {
    await knex.schema.alterTable('locations', (table) => {
      table.dropColumn('geom');
    });
  }

  await knex.schema.alterTable('locations', (table) => {
    table.specificType('geom', 'geography(Point, 4326)').nullable();
  });

  await knex.raw(`
    UPDATE locations
    SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
  `);

  await knex.raw(`CREATE INDEX IF NOT EXISTS idx_locations_geom ON locations USING GIST (geom)`);
}

export async function down(knex) {
  await knex.raw(`DROP INDEX IF EXISTS idx_users_geom`);
  await knex.raw(`DROP INDEX IF EXISTS idx_locations_geom`);

  const hasUserGeom = await knex.schema.hasColumn('users', 'geom');
  if (hasUserGeom) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('geom');
    });
  }

  const hasLocationGeom = await knex.schema.hasColumn('locations', 'geom');
  if (hasLocationGeom) {
    await knex.schema.alterTable('locations', (table) => {
      table.dropColumn('geom');
    });
  }
}
