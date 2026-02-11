-- V8__Seed_Production_Data.sql
-- Realistic 4-month production data

-- Insert Admin Users
INSERT INTO users (id, email, password, full_name, role, is_active, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'admin@euroreute.com', '$2a$10$slYQmyNdGzin7olVAklzu.OPST9/PgBkqquzi.Ss8KCUgzDMBUGI2', 'Admin Principal', 'ADMIN', true, CURRENT_TIMESTAMP - INTERVAL '120 days', CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440002', 'manager@euroreute.com', '$2a$10$slYQmyNdGzin7olVAklzu.OPST9/PgBkqquzi.Ss8KCUgzDMBUGI2', 'Manager Support', 'ADMIN', true, CURRENT_TIMESTAMP - INTERVAL '110 days', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Insert Driver Users (10 drivers)
INSERT INTO users (id, email, password, full_name, role, is_active, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440010', 'driver1@euroreute.com', '$2a$10$slYQmyNdGzin7olVAklzu.OPST9/PgBkqquzi.Ss8KCUgzDMBUGI2', 'Pierre Dupont', 'DRIVER', true, CURRENT_TIMESTAMP - INTERVAL '115 days', CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440011', 'driver2@euroreute.com', '$2a$10$slYQmyNdGzin7olVAklzu.OPST9/PgBkqquzi.Ss8KCUgzDMBUGI2', 'Marie Martin', 'DRIVER', true, CURRENT_TIMESTAMP - INTERVAL '110 days', CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440012', 'driver3@euroreute.com', '$2a$10$slYQmyNdGzin7olVAklzu.OPST9/PgBkqquzi.Ss8KCUgzDMBUGI2', 'Jean Bernard', 'DRIVER', true, CURRENT_TIMESTAMP - INTERVAL '100 days', CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440013', 'driver4@euroreute.com', '$2a$10$slYQmyNdGzin7olVAklzu.OPST9/PgBkqquzi.Ss8KCUgzDMBUGI2', 'Sophie Laurent', 'DRIVER', true, CURRENT_TIMESTAMP - INTERVAL '95 days', CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440014', 'driver5@euroreute.com', '$2a$10$slYQmyNdGzin7olVAklzu.OPST9/PgBkqquzi.Ss8KCUgzDMBUGI2', 'Michel Lefevre', 'DRIVER', true, CURRENT_TIMESTAMP - INTERVAL '90 days', CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440015', 'driver6@euroreute.com', '$2a$10$slYQmyNdGzin7olVAklzu.OPST9/PgBkqquzi.Ss8KCUgzDMBUGI2', 'Isabelle Leclerc', 'DRIVER', true, CURRENT_TIMESTAMP - INTERVAL '85 days', CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440016', 'driver7@euroreute.com', '$2a$10$slYQmyNdGzin7olVAklzu.OPST9/PgBkqquzi.Ss8KCUgzDMBUGI2', 'Thomas Moreau', 'DRIVER', true, CURRENT_TIMESTAMP - INTERVAL '80 days', CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440017', 'driver8@euroreute.com', '$2a$10$slYQmyNdGzin7olVAklzu.OPST9/PgBkqquzi.Ss8KCUgzDMBUGI2', 'Claire Renaud', 'DRIVER', true, CURRENT_TIMESTAMP - INTERVAL '75 days', CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440018', 'driver9@euroreute.com', '$2a$10$slYQmyNdGzin7olVAklzu.OPST9/PgBkqquzi.Ss8KCUgzDMBUGI2', 'Laurent Girard', 'DRIVER', true, CURRENT_TIMESTAMP - INTERVAL '70 days', CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440019', 'driver10@euroreute.com', '$2a$10$slYQmyNdGzin7olVAklzu.OPST9/PgBkqquzi.Ss8KCUgzDMBUGI2', 'Emma Bonnet', 'DRIVER', true, CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Insert Drivers
INSERT INTO drivers (id, full_name, phone, email, is_active, vehicle_info, user_id, created_at, updated_at)
VALUES 
    ('650e8400-e29b-41d4-a716-446655440010', 'Pierre Dupont', '0601020304', 'driver1@euroreute.com', true, 'Van white', '550e8400-e29b-41d4-a716-446655440010', CURRENT_TIMESTAMP - INTERVAL '115 days', CURRENT_TIMESTAMP),
    ('650e8400-e29b-41d4-a716-446655440011', 'Marie Martin', '0602030405', 'driver2@euroreute.com', true, 'Truck', '550e8400-e29b-41d4-a716-446655440011', CURRENT_TIMESTAMP - INTERVAL '110 days', CURRENT_TIMESTAMP),
    ('650e8400-e29b-41d4-a716-446655440012', 'Jean Bernard', '0603040506', 'driver3@euroreute.com', true, 'Car sedan', '550e8400-e29b-41d4-a716-446655440012', CURRENT_TIMESTAMP - INTERVAL '100 days', CURRENT_TIMESTAMP),
    ('650e8400-e29b-41d4-a716-446655440013', 'Sophie Laurent', '0604050607', 'driver4@euroreute.com', true, 'Van', '550e8400-e29b-41d4-a716-446655440013', CURRENT_TIMESTAMP - INTERVAL '95 days', CURRENT_TIMESTAMP),
    ('650e8400-e29b-41d4-a716-446655440014', 'Michel Lefevre', '0605060708', 'driver5@euroreute.com', false, 'Truck', '550e8400-e29b-41d4-a716-446655440014', CURRENT_TIMESTAMP - INTERVAL '90 days', CURRENT_TIMESTAMP),
    ('650e8400-e29b-41d4-a716-446655440015', 'Isabelle Leclerc', '0606070809', 'driver6@euroreute.com', true, 'Car', '550e8400-e29b-41d4-a716-446655440015', CURRENT_TIMESTAMP - INTERVAL '85 days', CURRENT_TIMESTAMP),
    ('650e8400-e29b-41d4-a716-446655440016', 'Thomas Moreau', '0607080910', 'driver7@euroreute.com', true, 'Van', '550e8400-e29b-41d4-a716-446655440016', CURRENT_TIMESTAMP - INTERVAL '80 days', CURRENT_TIMESTAMP),
    ('650e8400-e29b-41d4-a716-446655440017', 'Claire Renaud', '0608091011', 'driver8@euroreute.com', true, 'Truck', '550e8400-e29b-41d4-a716-446655440017', CURRENT_TIMESTAMP - INTERVAL '75 days', CURRENT_TIMESTAMP),
    ('650e8400-e29b-41d4-a716-446655440018', 'Laurent Girard', '0609101112', 'driver9@euroreute.com', true, 'Car', '550e8400-e29b-41d4-a716-446655440018', CURRENT_TIMESTAMP - INTERVAL '70 days', CURRENT_TIMESTAMP),
    ('650e8400-e29b-41d4-a716-446655440019', 'Emma Bonnet', '0610111213', 'driver10@euroreute.com', true, 'Van', '550e8400-e29b-41d4-a716-446655440019', CURRENT_TIMESTAMP - INTERVAL '60 days', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Generate delivery requests with simpler approach (150 completed deliveries)
INSERT INTO delivery_requests 
(id, client_name, client_phone, client_email, pickup_address, delivery_address, item_type, item_size, item_weight, requested_date, requested_time, status, assigned_driver_id, internal_notes, tracking_number, created_at, updated_at, completed_at)
WITH dates AS (
  SELECT generate_series(1, 150) as n,
    (CURRENT_DATE - interval '1 day' * (generate_series(1, 150) % 80))::date as req_date
)
SELECT 
  'DR-' || LPAD(d.n::text, 4, '0'),
  'Client ' || d.n,
  '06' || LPAD((5000 + d.n)::text, 8, '0'),
  'client' || d.n || '@example.com',
  d.n || ' Rue de la Paix, Paris',
  d.n || ' Avenue Commerce, Lyon',
  CASE WHEN d.n % 4 = 0 THEN 'Documents' WHEN d.n % 4 = 1 THEN 'Colis' WHEN d.n % 4 = 2 THEN 'Electronique' ELSE 'Vetements' END,
  CASE WHEN d.n % 3 = 0 THEN 'Small' WHEN d.n % 3 = 1 THEN 'Medium' ELSE 'Large' END,
  ((d.n % 25) + 1)::varchar,
  d.req_date,
  '09:00:00'::time,
  'LIVRE',
  '650e8400-e29b-41d4-a716-44665544001' || (d.n % 10)::text,
  CASE WHEN d.n % 5 = 0 THEN 'Important' ELSE NULL END,
  'TRK-' || LPAD((1000 + d.n)::text, 6, '0'),
  d.req_date::timestamp,
  (d.req_date + interval '2 days')::timestamp,
  (d.req_date + interval '1 day')::timestamp
FROM dates d
ON CONFLICT (id) DO NOTHING;

-- Generate in-progress deliveries (100 deliveries)
INSERT INTO delivery_requests 
(id, client_name, client_phone, client_email, pickup_address, delivery_address, item_type, item_size, item_weight, requested_date, requested_time, status, assigned_driver_id, internal_notes, tracking_number, created_at, updated_at)
WITH dates AS (
  SELECT generate_series(151, 250) as n,
    (CURRENT_DATE - interval '1 day' * (generate_series(151, 250) % 30))::date as req_date
)
SELECT 
  'DR-' || LPAD(d.n::text, 4, '0'),
  'Client ' || d.n,
  '06' || LPAD((5000 + d.n)::text, 8, '0'),
  'client' || d.n || '@example.com',
  d.n || ' Rue de la Paix, Marseille',
  d.n || ' Avenue Commerce, Toulouse',
  CASE WHEN d.n % 4 = 0 THEN 'Documents' WHEN d.n % 4 = 1 THEN 'Colis' WHEN d.n % 4 = 2 THEN 'Electronique' ELSE 'Vetements' END,
  CASE WHEN d.n % 3 = 0 THEN 'Small' WHEN d.n % 3 = 1 THEN 'Medium' ELSE 'Large' END,
  ((d.n % 25) + 1)::varchar,
  d.req_date,
  '09:00:00'::time,
  'EN_COURS',
  '650e8400-e29b-41d4-a716-44665544001' || ((d.n - 150) % 10)::text,
  CASE WHEN d.n % 7 = 0 THEN 'Urgent' ELSE NULL END,
  'TRK-' || LPAD((1000 + d.n)::text, 6, '0'),
  d.req_date::timestamp,
  CURRENT_TIMESTAMP
FROM dates d
ON CONFLICT (id) DO NOTHING;

-- Generate pending deliveries (100 deliveries)
INSERT INTO delivery_requests 
(id, client_name, client_phone, client_email, pickup_address, delivery_address, item_type, item_size, item_weight, requested_date, requested_time, status, internal_notes, tracking_number, created_at, updated_at)
WITH dates AS (
  SELECT generate_series(251, 350) as n,
    (CURRENT_DATE - interval '1 day' * (generate_series(251, 350) % 15))::date as req_date
)
SELECT 
  'DR-' || LPAD(d.n::text, 4, '0'),
  'Client ' || d.n,
  '06' || LPAD((5000 + d.n)::text, 8, '0'),
  'client' || d.n || '@example.com',
  d.n || ' Rue de la Paix, Nice',
  d.n || ' Avenue Commerce, Bordeaux',
  CASE WHEN d.n % 4 = 0 THEN 'Documents' WHEN d.n % 4 = 1 THEN 'Colis' WHEN d.n % 4 = 2 THEN 'Electronique' ELSE 'Vetements' END,
  CASE WHEN d.n % 3 = 0 THEN 'Small' WHEN d.n % 3 = 1 THEN 'Medium' ELSE 'Large' END,
  ((d.n % 25) + 1)::varchar,
  d.req_date,
  '09:00:00'::time,
  'EN_ATTENTE',
  CASE WHEN d.n % 6 = 0 THEN 'Routine' ELSE NULL END,
  'TRK-' || LPAD((1000 + d.n)::text, 6, '0'),
  d.req_date::timestamp,
  d.req_date::timestamp
FROM dates d
ON CONFLICT (id) DO NOTHING;

-- Insert Contact Messages (100 messages)
INSERT INTO contact_messages (id, name, email, subject, message, is_read, created_at)
WITH msg_data AS (
  SELECT generate_series(1, 100) as n
)
SELECT
  'MSG-' || LPAD(m.n::text, 4, '0'),
  'Customer ' || m.n,
  'customer' || m.n || '@example.com',
  CASE 
    WHEN m.n % 5 = 0 THEN 'Tarifs'
    WHEN m.n % 5 = 1 THEN 'Probleme livraison'
    WHEN m.n % 5 = 2 THEN 'Ou est mon colis'
    WHEN m.n % 5 = 3 THEN 'Devenir chauffeur'
    ELSE 'Suivre commande'
  END,
  CASE 
    WHEN m.n % 5 = 0 THEN 'Demande info sur les tarifs'
    WHEN m.n % 5 = 1 THEN 'Probleme avec ma livraison'
    WHEN m.n % 5 = 2 THEN 'Ou est mon colis'
    WHEN m.n % 5 = 3 THEN 'Interet pour devenir chauffeur'
    ELSE 'Comment suivre ma commande'
  END,
  CASE WHEN m.n % 3 = 0 THEN false ELSE true END,
  CURRENT_TIMESTAMP - interval '1 day' * (m.n % 90)
FROM msg_data m
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_delivery_status ON delivery_requests(status);
CREATE INDEX IF NOT EXISTS idx_delivery_created ON delivery_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drivers_phone ON drivers(phone);
CREATE INDEX IF NOT EXISTS idx_contact_read ON contact_messages(is_read);
