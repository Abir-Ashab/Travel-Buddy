export async function up(knex) {
  await knex.schema.alterTable('accommodation', (table) => {
    table.string('accommodation_type').alter();
  });

  await knex.schema.alterTable('dining', (table) => {
    table.string('meal_type').alter();
  });

  await knex.schema.alterTable('attractions', (table) => {
    table.string('attraction_type').alter();
    table.string('best_time_to_visit').alter();
  });

  await knex.raw(`ALTER TABLE "accommodation" DROP CONSTRAINT IF EXISTS "accommodation_accommodation_type_check"`);
  await knex.raw(`ALTER TABLE "dining" DROP CONSTRAINT IF EXISTS "dining_meal_type_check"`);
  await knex.raw(`ALTER TABLE "attractions" DROP CONSTRAINT IF EXISTS "attractions_attraction_type_check"`);
  await knex.raw(`ALTER TABLE "attractions" DROP CONSTRAINT IF EXISTS "attractions_best_time_to_visit_check"`);

  await knex.raw(`DROP TYPE IF EXISTS "accommodation_accommodation_type_enum"`);
  await knex.raw(`DROP TYPE IF EXISTS "dining_meal_type_enum"`);
  await knex.raw(`DROP TYPE IF EXISTS "attractions_attraction_type_enum"`);
  await knex.raw(`DROP TYPE IF EXISTS "attractions_best_time_to_visit_enum"`);
}

export async function down(knex) {
  await knex.schema.alterTable('accommodation', (table) => {
    table.enum('accommodation_type', ['hotel', 'hostel', 'airbnb', 'guesthouse']).notNullable().alter();
  });

  await knex.schema.alterTable('dining', (table) => {
    table.enum('meal_type', ['breakfast', 'lunch', 'dinner', 'snack']).notNullable().alter();
  });

  await knex.schema.alterTable('attractions', (table) => {
    table.enum('attraction_type', ['museum', 'monument', 'park', 'beach', 'temple', 'market', 'viewpoint', 'adventure']).notNullable().alter();
    table.enum('best_time_to_visit', ['morning', 'afternoon', 'evening', 'night']).notNullable().alter();
  });
}
