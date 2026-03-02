const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON');

        // Create Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            password TEXT,
            first_name TEXT,
            last_name TEXT,
            is_active BOOLEAN DEFAULT 1,
            role TEXT DEFAULT 'staff'
        )`);
        
        db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'staff'", () => {});


        // Create Tasks Table
        db.run(`CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'pending',
            priority TEXT DEFAULT 'medium',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            due_date TEXT,
            owner INTEGER,
            assignee INTEGER,
            FOREIGN KEY (owner) REFERENCES users(id),
            FOREIGN KEY (assignee) REFERENCES users(id)
        )`);

        // Create default admin user if not exists
        db.get("SELECT id FROM users WHERE username = ?", ["admin@gmail.com"], (err, row) => {
            if (!row) {
                const bcrypt = require('bcryptjs');
                const hash = bcrypt.hashSync("admin123", 10);
                db.run(
                    "INSERT INTO users (username, email, password, first_name, last_name, is_active, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    ["admin@gmail.com", "admin@gmail.com", hash, "Admin", "User", 1, "admin"]
                );
            }
        });
    }
});

module.exports = db;
