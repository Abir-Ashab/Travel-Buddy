export async function up(knex) {
  const constraintResult = await knex.raw(`
    SELECT constraint_name 
    FROM information_schema.check_constraints 
    WHERE constraint_schema = current_schema() 
    AND constraint_name LIKE '%notifications_type_check%'
  `);
  
  const constraintName = constraintResult.rows[0]?.constraint_name;
  
  if (constraintName) {
    await knex.raw(`ALTER TABLE notifications DROP CONSTRAINT ${constraintName}`);
  }
  await knex.raw(`
    ALTER TABLE notifications 
    ADD CONSTRAINT notifications_type_check 
    CHECK (type IN (
      'like', 
      'save', 
      'trip_invite', 
      'match_found', 
      'wishlist_share',
      'nearby_wishlist_location',
      'nearby_trip_participant', 
      'nearby_featured_post'
    ))
  `);
}

export async function down(knex) {
  await knex.raw(`ALTER TABLE notifications DROP CONSTRAINT notifications_type_check`);
  await knex.raw(`
    ALTER TABLE notifications 
    ADD CONSTRAINT notifications_type_check 
    CHECK (type IN (
      'like', 
      'save', 
      'trip_invite', 
      'match_found', 
      'wishlist_share'
    ))
  `);
}