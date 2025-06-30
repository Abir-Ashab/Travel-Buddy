export async function up(knex) {
  const hasLocationColumnInAccommodation = await knex.schema.hasColumn('accommodation', 'location_id');
  if (!hasLocationColumnInAccommodation) {
    await knex.schema.alterTable('accommodation', (table) => {
      table.uuid('location_id').nullable()
        .references('id').inTable('locations')
        .onDelete('SET NULL')
        .index();
    });
  }

  const hasLocationColumnInDining = await knex.schema.hasColumn('dining', 'location_id');
  if (!hasLocationColumnInDining) {
    await knex.schema.alterTable('dining', (table) => {
      table.uuid('location_id').nullable()
        .references('id').inTable('locations')
        .onDelete('SET NULL')
        .index();
    });
  }

  const hasLocationColumnInAttractions = await knex.schema.hasColumn('attractions', 'location_id');
  if (!hasLocationColumnInAttractions) {
    await knex.schema.alterTable('attractions', (table) => {
      table.uuid('location_id').nullable()
        .references('id').inTable('locations')
        .onDelete('SET NULL')
        .index();
    });
  }

  const hasGeomColumn = await knex.schema.hasColumn('locations', 'geom');
  if (!hasGeomColumn) {
    await knex.schema.alterTable('locations', (table) => {
      table.specificType('geom', 'geometry(Point, 4326)').nullable();
    });

    await knex.raw(`
      UPDATE locations
      SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
      WHERE longitude IS NOT NULL AND latitude IS NOT NULL;
    `);
  }
}

export async function down(knex) {
  const dropIfExists = async (tableName, columnName) => {
    const hasCol = await knex.schema.hasColumn(tableName, columnName);
    if (hasCol) {
      await knex.schema.alterTable(tableName, (table) => {
        table.dropColumn(columnName);
      });
    }
  };

  await dropIfExists('accommodation', 'location_id');
  await dropIfExists('dining', 'location_id');
  await dropIfExists('attractions', 'location_id');
  await dropIfExists('locations', 'geom');
}
