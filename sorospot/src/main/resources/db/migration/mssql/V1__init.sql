-- SQL Server compatible migration for Projeto_UPX schema

CREATE TABLE [user_role] (
  [id] INT IDENTITY(1,1) PRIMARY KEY,
  [user_role] NVARCHAR(500) UNIQUE NOT NULL,
  [deleted] BIT NOT NULL DEFAULT 0,
  [created_at] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  [last_updated] DATETIME2 NULL
);

CREATE TABLE [category] (
  [id] INT IDENTITY(1,1) PRIMARY KEY,
  [type] NVARCHAR(50) NOT NULL,
  [color] NVARCHAR(50) NOT NULL,
  [deleted] BIT NOT NULL DEFAULT 0,
  [created_at] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  [last_updated] DATETIME2 NULL
);

CREATE TABLE [users] (
  [id] INT IDENTITY(1,1) PRIMARY KEY,
  [cpf] NVARCHAR(20) NOT NULL,
  [telephone] NVARCHAR(50) NOT NULL,
  [email] NVARCHAR(100) NOT NULL,
  [password] NVARCHAR(200) NOT NULL,
  [photo] NVARCHAR(200),
  [role_id] INT NOT NULL,
  CONSTRAINT fk_users_role FOREIGN KEY ([role_id]) REFERENCES [user_role]([id])
);

CREATE TABLE [occurrence] (
  [id] INT IDENTITY(1,1) PRIMARY KEY,
  [user_id] INT NOT NULL,
  [category_id] INT NOT NULL,
  [description] NVARCHAR(500) NOT NULL,
  [photo] NVARCHAR(200),
  [status] NVARCHAR(100),
  [address] NVARCHAR(255),
  [latitude] NVARCHAR(50),
  [longitude] NVARCHAR(50),
  [deleted] BIT NOT NULL DEFAULT 0,
  [created_at] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  [last_updated] DATETIME2 NULL,
  CONSTRAINT fk_occurrence_user FOREIGN KEY ([user_id]) REFERENCES [users]([id]),
  CONSTRAINT fk_occurrence_category FOREIGN KEY ([category_id]) REFERENCES [category]([id])
);
