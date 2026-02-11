-- V6__Add_Location_Coordinates_And_Map_Flags.sql

-- Add coordinate and map flag columns to delivery_requests table
ALTER TABLE delivery_requests
ADD COLUMN IF NOT EXISTS pickup_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS pickup_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS delivery_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS delivery_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS pickup_from_map BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS delivery_from_map BOOLEAN DEFAULT false;

-- Create indexes for coordinate columns for faster geospatial queries
CREATE INDEX IF NOT EXISTS idx_delivery_requests_pickup_coords ON delivery_requests(pickup_lat, pickup_lng);
CREATE INDEX IF NOT EXISTS idx_delivery_requests_delivery_coords ON delivery_requests(delivery_lat, delivery_lng);
