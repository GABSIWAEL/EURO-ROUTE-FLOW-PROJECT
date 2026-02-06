-- V2__Add_UserId_To_Drivers.sql
-- Add user_id column to drivers table to link drivers to users (if not already present)
ALTER TABLE drivers
ADD COLUMN IF NOT EXISTS user_id VARCHAR(36);

-- Create index for faster lookups (if not already present)
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
