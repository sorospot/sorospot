-- Add missing columns that JPA entities expect: users.name, occurrence.color, occurrence.title
-- Use conditional checks to avoid errors if columns already exist or SQL Server cannot resolve names

IF COL_LENGTH('dbo.[users]', 'name') IS NULL
BEGIN
    ALTER TABLE dbo.[users] ADD [name] NVARCHAR(200) NULL;
END

IF COL_LENGTH('dbo.[occurrence]', 'color') IS NULL
BEGIN
    ALTER TABLE dbo.[occurrence] ADD [color] NVARCHAR(50) NULL;
END

IF COL_LENGTH('dbo.[occurrence]', 'title') IS NULL
BEGIN
    ALTER TABLE dbo.[occurrence] ADD [title] NVARCHAR(255) NULL;
END

-- Populate reasonable defaults for existing rows using dynamic SQL (execute only if column exists)
IF COL_LENGTH('dbo.[users]', 'name') IS NOT NULL
BEGIN
    EXEC sp_executesql N'UPDATE dbo.[users] SET [name] = [email] WHERE [name] IS NULL';
END

IF COL_LENGTH('dbo.[occurrence]', 'color') IS NOT NULL
BEGIN
    EXEC sp_executesql N'UPDATE dbo.[occurrence] SET [color] = ''#ff0000'' WHERE [color] IS NULL';
END

IF COL_LENGTH('dbo.[occurrence]', 'title') IS NOT NULL
BEGIN
    EXEC sp_executesql N'UPDATE dbo.[occurrence] SET [title] = ''Sem título'' WHERE [title] IS NULL';
END
