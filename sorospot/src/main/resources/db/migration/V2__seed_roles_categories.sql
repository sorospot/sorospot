-- Valores padrao para as tabelas user_role e category do Projeto_UPX

INSERT INTO user_role (user_role, deleted, created_at) VALUES ('ADMIN', FALSE, CURRENT_TIMESTAMP());
INSERT INTO user_role (user_role, deleted, created_at) VALUES ('USER', FALSE, CURRENT_TIMESTAMP());

INSERT INTO category (type, color, deleted, created_at) VALUES ('buraco', '#ff0000', FALSE, CURRENT_TIMESTAMP());
INSERT INTO category (type, color, deleted, created_at) VALUES ('acidente', '#ffa500', FALSE, CURRENT_TIMESTAMP());
INSERT INTO category (type, color, deleted, created_at) VALUES ('outros', '#888888', FALSE, CURRENT_TIMESTAMP());
