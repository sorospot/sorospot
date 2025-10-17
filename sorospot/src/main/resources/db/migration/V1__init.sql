-- Flyway migration for Projeto_UPX schema (H2 compatible)

CREATE TABLE user_role (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_role VARCHAR(500) UNIQUE NOT NULL,
  deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP
);

CREATE TABLE category (
  id INT PRIMARY KEY AUTO_INCREMENT,
  type VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP
);

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cpf VARCHAR(20) NOT NULL,
  telephone VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(200) NOT NULL,
  photo VARCHAR(200),
  role_id INT NOT NULL,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES user_role(id)
);

CREATE TABLE occurrence (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  description VARCHAR(500) NOT NULL,
  photo VARCHAR(200),
  status VARCHAR(100),
  address VARCHAR(255),
  deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP,
  CONSTRAINT fk_occurrence_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_occurrence_category FOREIGN KEY (category_id) REFERENCES category(id)
);
