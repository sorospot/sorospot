-- V6: Add color column to occurrence
ALTER TABLE occurrence ADD COLUMN color VARCHAR(32);
-- set default color for existing rows
UPDATE occurrence SET color = '#ff0000' WHERE color IS NULL;