npm run migrate:make table_name
npm run migrate
npm run migrate:rollback

### If you want to add new field
- create new migration file like this : npm run migrate:make add_phone_number_user_table
- add the field like this:
```js
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
```
- npm run migrate
