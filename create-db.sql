-- PostgreSQL

CREATE DATABASE messenger;
\connect messenger;

CREATE TABLE Users (
    id              BIGSERIAL PRIMARY KEY,
    login           VARCHAR(64) NOT NULL,
    password_hash   BYTEA NOT NULL,
    shown_name      VARCHAR(256),
    online          BOOLEAN
);

CREATE TABLE Chats (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(256) NOT NULL
);

CREATE TABLE Messages (
    id              BIGSERIAL PRIMARY KEY,
    time_stamp      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    message         VARCHAR(10000),
    author_id       BIGINT NOT NULL REFERENCES Users(id),
    chat_id         BIGINT NOT NULL REFERENCES Chats(id),
    seen            BOOLEAN DEFAULT FALSE
);

CREATE TABLE UserContacts (
    id              BIGSERIAL PRIMARY KEY,
    owner_id        BIGINT NOT NULL REFERENCES Users(id),
    user_id         BIGINT NOT NULL REFERENCES Users(id),
    pseudonym       VARCHAR(256)
);

CREATE TABLE ChatContacts (
	id              BIGSERIAL PRIMARY KEY,
	owner_id        BIGINT NOT NULL REFERENCES Users(id),
	chat_id         BIGINT NOT NULL REFERENCES Chats(id),
	pseudonym       VARCHAR(256)
);

CREATE TABLE Tokens (
    id              SERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES Users(id),
    token           BYTEA
);


CREATE USER web_backend WITH PASSWORD 'web_backend_password';
GRANT ALL ON TABLE users, tokens TO web_backend;
GRANT ALL ON SEQUENCE users_id_seq, tokens_id_seq TO web_backend;

CREATE USER chat_backend WITH PASSWORD 'chat_backend_password';
GRANT ALL ON ALL TABLES IN SCHEMA public TO chat_backend;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO chat_backend;
