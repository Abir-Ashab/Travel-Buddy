export async function up(knex) {
  await knex.schema.alterTable('attractions', async (table) => {
    await knex.raw(`
      ALTER TABLE attractions
      DROP CONSTRAINT IF EXISTS attractions_attraction_type_check;
    `);
    await knex.raw(`ALTER TABLE attractions ALTER COLUMN attraction_type TYPE TEXT;`);
  });

  await knex.schema.alterTable('attractions', async (table) => {
    await knex.raw(`
      ALTER TABLE attractions
      DROP CONSTRAINT IF EXISTS attractions_best_time_to_visit_check;
    `);
    await knex.raw(`ALTER TABLE attractions ALTER COLUMN best_time_to_visit TYPE TEXT;`);
  });

  await knex.schema.alterTable('accommodation', async (table) => {
    await knex.raw(`
      ALTER TABLE accommodation
      DROP CONSTRAINT IF EXISTS accommodation_accommodation_type_check;
    `);
    await knex.raw(`ALTER TABLE accommodation ALTER COLUMN accommodation_type TYPE TEXT;`);
  });

  await knex.schema.alterTable('dining', async (table) => {
    await knex.raw(`
      ALTER TABLE dining
      DROP CONSTRAINT IF EXISTS dining_meal_type_check;
    `);
    await knex.raw(`ALTER TABLE dining ALTER COLUMN meal_type TYPE TEXT;`);
  });

  console.log('Columns altered to string successfully 🚀');
};

export async function down(knex) {
  console.log('No down migration — reversing type back to ENUM manually if needed.');
}
