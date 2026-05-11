-- Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'FoodDeliveryDB')
BEGIN
    CREATE DATABASE FoodDeliveryDB;
END
GO

USE FoodDeliveryDB;
GO

-- Seed Roles
IF NOT EXISTS (SELECT * FROM roles WHERE role_name = 'ADMIN')
BEGIN
    INSERT INTO roles (role_name) VALUES ('ADMIN'), ('CUSTOMER'), ('STAFF'), ('DELIVERY');
END
GO

-- Note: The rest of the schema is managed by Hibernate (spring.jpa.hibernate.ddl-auto=update).
-- The seed data below assumes Hibernate has already created the tables.
-- To run this completely manually, you would need to run the app once for Hibernate to generate tables, then run these inserts.
-- Or better, we can seed users and categories.

-- Wait for tables to exist (this script might be run manually after app starts)
IF OBJECT_ID('users', 'U') IS NOT NULL
BEGIN
    -- Seed Admin User (password: 'admin123' or similar, depending on how the app hashes passwords. Assuming plain text or no hash for this simple university project since it's just 'password' in User constructor in models)
    IF NOT EXISTS (SELECT * FROM users WHERE email = 'admin@foodapp.com')
    BEGIN
        DECLARE @adminRoleId BIGINT = (SELECT role_id FROM roles WHERE role_name = 'ADMIN');
        INSERT INTO users (dtype, name, email, password, phone_number, created_at, role_id)
        VALUES ('ADMIN', 'System Admin', 'admin@foodapp.com', 'admin123', '1234567890', GETDATE(), @adminRoleId);
    END
    
    -- Seed Customer
    IF NOT EXISTS (SELECT * FROM users WHERE email = 'customer@foodapp.com')
    BEGIN
        DECLARE @customerRoleId BIGINT = (SELECT role_id FROM roles WHERE role_name = 'CUSTOMER');
        INSERT INTO users (dtype, name, email, password, phone_number, created_at, role_id)
        VALUES ('CUSTOMER', 'John Doe', 'customer@foodapp.com', 'customer123', '0987654321', GETDATE(), @customerRoleId);
    END
END
GO

IF OBJECT_ID('categories', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT * FROM categories WHERE name = 'Pizza')
    BEGIN
        INSERT INTO categories (name, description, icon) VALUES 
        ('Pizza', 'Delicious hot pizzas', '🍕'),
        ('Burgers', 'Juicy beef and chicken burgers', '🍔'),
        ('Drinks', 'Refreshing beverages', '🥤');
    END
END
GO

IF OBJECT_ID('products', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT * FROM products WHERE name = 'Margherita Pizza')
    BEGIN
        DECLARE @pizzaId BIGINT = (SELECT id FROM categories WHERE name = 'Pizza');
        DECLARE @burgerId BIGINT = (SELECT id FROM categories WHERE name = 'Burgers');
        
        INSERT INTO products (name, description, price, available, category_id, image_url) VALUES 
        ('Margherita Pizza', 'Classic cheese and tomato', 12.99, 1, @pizzaId, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=60'),
        ('Pepperoni Pizza', 'Double pepperoni with extra cheese', 14.99, 1, @pizzaId, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=60'),
        ('Cheeseburger', 'Double beef patty with cheddar', 8.99, 1, @burgerId, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60');
    END
END
GO
