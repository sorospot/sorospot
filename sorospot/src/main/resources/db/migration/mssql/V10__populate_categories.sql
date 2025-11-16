-- Add icon column to category table and populate default categories with their colors and icons

-- Add icon column if it doesn't exist
IF COL_LENGTH('dbo.[category]', 'icon') IS NULL
BEGIN
    ALTER TABLE dbo.[category] ADD [icon] NVARCHAR(100) NULL;
END;
GO

-- Insert or update predefined categories with colors and Google Material Icons
-- Using MERGE to avoid conflicts with existing data

MERGE INTO dbo.[category] AS target
USING (VALUES
    ('Pavimentação', '#424242', 'construction'),
    ('Lixo', '#795548', 'delete'),
    ('Iluminação', '#FF9800', 'lightbulb'),
    ('Crime', '#F44336', 'warning'),
    ('Sinalização', '#9C27B0', 'traffic'),
    ('Policia', '#2196F3', 'local_police'),
    ('Trânsito', '#000000', 'directions_car')
) AS source ([type], [color], [icon])
ON target.[type] = source.[type]
WHEN MATCHED THEN
    UPDATE SET 
        target.[color] = source.[color],
        target.[icon] = source.[icon],
        target.[last_updated] = GETDATE()
WHEN NOT MATCHED THEN
    INSERT ([type], [color], [icon], [deleted], [created_at])
    VALUES (source.[type], source.[color], source.[icon], 0, GETDATE());
