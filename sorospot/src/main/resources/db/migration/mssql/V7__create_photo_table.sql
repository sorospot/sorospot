-- Create photo table for SQL Server. Data migration (if needed) handled separately.
CREATE TABLE [photo] (
  [id] INT IDENTITY(1,1) PRIMARY KEY,
  [occurrence_id] INT NULL,
  [filename] NVARCHAR(1024) NULL,
  [created_at] DATETIME2 NULL,
  CONSTRAINT fk_photo_occurrence FOREIGN KEY ([occurrence_id]) REFERENCES [occurrence]([id])
);
