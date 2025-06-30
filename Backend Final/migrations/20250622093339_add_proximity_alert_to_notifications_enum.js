export async function up(knex) {
  await knex.raw(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notifications_type') THEN
        CREATE TYPE notifications_type AS ENUM ('like', 'save', 'trip_invite', 'match_found', 'wishlist_share');
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'proximity_alert' 
          AND enumtypid = 'notifications_type'::regtype
      ) THEN
        ALTER TYPE "notifications_type" ADD VALUE 'proximity_alert';
      END IF;
    END$$;
  `);
}

export async function down(knex) {
  // Note: Postgres does not support removing a value from an ENUM.
  // You can leave this empty or optionally recreate the enum without the new value.
}
