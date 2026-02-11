-- Add foreign key constraint with cascade delete from drivers.user_id to users.id
ALTER TABLE drivers
DROP CONSTRAINT IF EXISTS fk_drivers_user_id;

ALTER TABLE drivers
ADD CONSTRAINT fk_drivers_user_id 
FOREIGN KEY (user_id) 
REFERENCES users(id) 
ON DELETE CASCADE 
ON UPDATE CASCADE;
