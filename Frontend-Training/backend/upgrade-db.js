const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
    // Add role column to users table if it doesn't exist
    db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'", function(err) {
        if (err && err.message.includes('duplicate column name')) {
            console.log("Column 'role' already exists.");
        } else if (err) {
            console.error("Error adding column:", err.message);
        } else {
            console.log("Column 'role' added successfully.");
        }
        
        // Ensure admin user has 'admin' role
        db.run("UPDATE users SET role = 'admin' WHERE username = 'admin' OR email = 'admin@gmail.com' OR username = 'admin@gmail.com'", function(err) {
            if (err) console.error("Error setting admin role:", err.message);
            else console.log(`Admin role updated for ${this.changes} rows.`);
            
            db.all("SELECT id, username, email, role FROM users", (err, rows) => {
                console.log("Current Users:", rows);
                db.close();
            });
        });
    });
});
