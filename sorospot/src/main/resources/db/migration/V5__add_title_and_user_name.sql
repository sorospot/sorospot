-- V5: Add title column to occurrence and name to users; set demo user name
ALTER TABLE occurrence ADD COLUMN title VARCHAR(200);
ALTER TABLE users ADD COLUMN name VARCHAR(100);

UPDATE users SET name = 'Demo User' WHERE email = 'demo@sorospot.local';
