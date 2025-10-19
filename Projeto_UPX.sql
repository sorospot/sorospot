CREATE DATABASE Projeto_UPX

USE Projeto_UPX

CREATE TABLE category
(
	id int primary key identity not null,
	type varchar(50) not null,
	color varchar(50) not null,
	deleted bit not null,
	created_at datetime not null,
	last_updated datetime
)


CREATE TABLE user_role
(
	id int primary key identity not null,
	user_role varchar(500) unique not null,
	deleted bit not null,
	created_at datetime not null,
	last_updated datetime
)

CREATE TABLE [user]
(
	id int primary key identity not null,
	name varchar(100) not null,
	cpf int unique not null,
	telephone int not null,
	email varchar(100) not null,
	password varchar(100) not null,
	photo varchar(255),
	deleted bit not null,
    created_at datetime not null,
    last_updated datetime,
	role_id int references user_role(id) not null
)

CREATE TABLE occurrence
(
	id int primary key identity not null,
	user_id int references users(id) not null,
	category_id int references category(id) not null,
	description varchar(500) not null,
	photo varchar(100),
	status varchar(100),
	address varchar(100),
	latitude decimal(10,8) not null,
	longitude decimal(11,8) not null,
	deleted bit not null,
	created_at datetime not null,
	last_updated datetime
)
