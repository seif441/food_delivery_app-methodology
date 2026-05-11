-- Basic schema generated for Food Delivery App
-- Note: It is recommended to let Hibernate auto-generate the complete schema via spring.jpa.hibernate.ddl-auto=update

CREATE TABLE roles (
    role_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    role_name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    dtype VARCHAR(31) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255),
    created_at DATETIME2,
    role_id BIGINT,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

CREATE TABLE categories (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    icon VARCHAR(255)
);

CREATE TABLE products (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    price FLOAT NOT NULL,
    image_url VARCHAR(255),
    available BIT NOT NULL,
    category_id BIGINT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
