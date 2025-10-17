-- Usuario padrao para testes
INSERT INTO users (cpf, telephone, email, password, photo, role_id)
VALUES ('000.000.000-00','(00)00000-0000','demo@sorospot.local','$2a$10$demo','', (SELECT id FROM user_role WHERE user_role='USER' LIMIT 1));
