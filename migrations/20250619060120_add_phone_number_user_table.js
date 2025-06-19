export async function up(knex) {
  return knex.schema.alterTable('users', (table) => {
    table.string('number').nullable().after('email'); 
  });
}

export async function down(knex) {
  return knex.schema.alterTable('users', (table) => {
    table.dropColumn('number');
  });
}
