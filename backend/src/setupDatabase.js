import mysql from "mysql2";
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

const databaseName = process.env.DB_NAME;

const createDatabaseAndTables = async () => {
    try {
        // Connect to the MySQL server
        connection.connect();

        // Create the database if it doesn't exist
        await connection.promise().query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\`;`);

        // Use the newly created database
        await connection.promise().query(`USE \`${databaseName}\`;`);

        // Create a table named `tickets`
        await connection.promise().query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        id_number VARCHAR(255) NOT NULL,
        wallet_address VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        token_id VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Create a table named `redeemables`
        await connection.promise().query(`
      CREATE TABLE IF NOT EXISTS redeemables (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_id INT NOT NULL,
        token_id VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id)
      );
    `);

        console.log('Database and tables created successfully!');
    } catch (err) {
        console.error('Error setting up the database:', err);
    } finally {
        connection.end();
    }
};

createDatabaseAndTables();