-- V9__Seed_Production_Data_4_Months.sql
-- Realistic 4-month production data without drivers and additional users

-- Generate delivery requests with simpler approach (500 deliveries distributed over 4 months)
INSERT INTO delivery_requests 
(id, client_name, client_phone, client_email, pickup_address, delivery_address, item_type, item_size, item_weight, requested_date, requested_time, status, internal_notes, tracking_number, created_at, updated_at, completed_at)
WITH dates AS (
  SELECT generate_series(1, 500) as n,
    (CURRENT_DATE - interval '1 day' * (generate_series(1, 500) % 120))::date as req_date
)
SELECT 
  'DR-' || LPAD(d.n::text, 5, '0'),
  'Client ' || d.n,
  '06' || LPAD((5000 + d.n)::text, 8, '0'),
  'client' || d.n || '@example.com',
  d.n || ' Rue de la Paix, ' || CASE WHEN d.n % 5 = 0 THEN 'Paris' WHEN d.n % 5 = 1 THEN 'Lyon' WHEN d.n % 5 = 2 THEN 'Marseille' WHEN d.n % 5 = 3 THEN 'Toulouse' ELSE 'Nice' END,
  d.n || ' Avenue Commerce, ' || CASE WHEN d.n % 4 = 0 THEN 'Bordeaux' WHEN d.n % 4 = 1 THEN 'Lille' WHEN d.n % 4 = 2 THEN 'Nantes' ELSE 'Strasbourg' END,
  CASE WHEN d.n % 4 = 0 THEN 'Documents' WHEN d.n % 4 = 1 THEN 'Colis' WHEN d.n % 4 = 2 THEN 'Electronique' ELSE 'Vetements' END,
  CASE WHEN d.n % 3 = 0 THEN 'Small' WHEN d.n % 3 = 1 THEN 'Medium' ELSE 'Large' END,
  ((d.n % 25) + 1)::varchar,
  d.req_date,
  '09:00:00'::time,
  CASE 
    WHEN d.n <= 250 THEN 'LIVRE'
    WHEN d.n <= 375 THEN 'EN_COURS'
    ELSE 'EN_ATTENTE'
  END,
  CASE WHEN d.n % 7 = 0 THEN 'Important client' WHEN d.n % 11 = 0 THEN 'Signature requise' ELSE NULL END,
  'TRK-' || LPAD((10000 + d.n)::text, 7, '0'),
  d.req_date::timestamp,
  CASE 
    WHEN d.n <= 250 THEN (d.req_date + interval '2 days')::timestamp
    WHEN d.n <= 375 THEN (d.req_date + interval '1 day')::timestamp
    ELSE d.req_date::timestamp
  END,
  CASE WHEN d.n <= 250 THEN (d.req_date + interval '1 day')::timestamp ELSE NULL END
FROM dates d
ON CONFLICT (id) DO NOTHING;

-- Insert Contact Messages (200 messages distributed over 4 months)
INSERT INTO contact_messages (id, name, email, subject, message, is_read, created_at)
WITH msg_data AS (
  SELECT generate_series(1, 200) as n
)
SELECT
  'MSG-' || LPAD(m.n::text, 5, '0'),
  'Customer ' || m.n,
  'customer' || m.n || '@example.com',
  CASE 
    WHEN m.n % 6 = 0 THEN 'Information sur les tarifs'
    WHEN m.n % 6 = 1 THEN 'Probleme de livraison'
    WHEN m.n % 6 = 2 THEN 'Ou est mon colis'
    WHEN m.n % 6 = 3 THEN 'Réclamation'
    WHEN m.n % 6 = 4 THEN 'Question produit'
    ELSE 'Suivi de commande'
  END,
  CASE 
    WHEN m.n % 6 = 0 THEN 'Pourriez-vous me confirmer les tarifs pour une livraison urgente?'
    WHEN m.n % 6 = 1 THEN 'Ma livraison n''est pas arrivée à la date prévue'
    WHEN m.n % 6 = 2 THEN 'Je n''ai reçu aucune info sur mon colis'
    WHEN m.n % 6 = 3 THEN 'J''ai reçu un colis endommagé, que puis-je faire?'
    WHEN m.n % 6 = 4 THEN 'Quels sont les délais de livraison standard?'
    ELSE 'Pouvez-vous me donner l''état de ma commande?'
  END,
  CASE WHEN m.n % 4 = 0 THEN false ELSE true END,
  CURRENT_TIMESTAMP - interval '1 day' * ((m.n % 120) + 1)
FROM msg_data m
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_delivery_status ON delivery_requests(status);
CREATE INDEX IF NOT EXISTS idx_delivery_created ON delivery_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_delivery_requested_date ON delivery_requests(requested_date);
CREATE INDEX IF NOT EXISTS idx_contact_read ON contact_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_messages(created_at DESC);