CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS weddings (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    wedding_name VARCHAR(255) NOT NULL,
    partner_one_name VARCHAR(255),
    partner_two_name VARCHAR(255),
    event_date TIMESTAMP,
    venue_name VARCHAR(255),
    city VARCHAR(255),
    state_province VARCHAR(255),
    budget NUMERIC(12,2),
    planning_stage VARCHAR(50) NOT NULL DEFAULT 'DISCOVERY',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS spring_session (
    primary_id CHAR(36) NOT NULL,
    session_id CHAR(36) NOT NULL UNIQUE,
    creation_time BIGINT NOT NULL,
    last_access_time BIGINT NOT NULL,
    max_inactive_interval INT NOT NULL,
    expiry_time BIGINT NOT NULL,
    principal_name VARCHAR(100),
    CONSTRAINT spring_session_pk PRIMARY KEY (primary_id)
);

CREATE TABLE IF NOT EXISTS spring_session_attributes (
    session_primary_id CHAR(36) NOT NULL,
    attribute_name VARCHAR(200) NOT NULL,
    attribute_bytes BYTEA NOT NULL,
    CONSTRAINT spring_session_attributes_pk PRIMARY KEY (session_primary_id, attribute_name),
    CONSTRAINT spring_session_attributes_fk FOREIGN KEY (session_primary_id) REFERENCES spring_session(primary_id) ON DELETE CASCADE
);
