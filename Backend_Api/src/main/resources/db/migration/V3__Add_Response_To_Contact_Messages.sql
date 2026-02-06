-- V3__Add_Response_To_Contact_Messages.sql
-- Add response column to contact_messages table
ALTER TABLE contact_messages
ADD COLUMN response TEXT;
