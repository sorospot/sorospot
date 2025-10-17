-- V4: Add latitude and longitude to occurrence and adjust address length
ALTER TABLE occurrence ALTER COLUMN address VARCHAR(100);

-- Add latitude and longitude with sensible defaults (0.0) so existing rows backfill
ALTER TABLE occurrence ADD COLUMN latitude DECIMAL(10,8) DEFAULT 0.0 NOT NULL;
ALTER TABLE occurrence ADD COLUMN longitude DECIMAL(11,8) DEFAULT 0.0 NOT NULL;

-- If H2 doesn't allow ALTER COLUMN length directly depending on version, one may need to create temp table.