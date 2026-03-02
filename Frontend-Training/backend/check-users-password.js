const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('database.sqlite');

db.all("SELECT id, username, email, password FROM users WHERE username != 'admin@gmail.com'", (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("Users found:", rows.length);
    rows.forEach(row => {
        const isValid = bcrypt.compareSync('user123', row.password);
        console.log(`User: ${row.username} (${row.email}), isValid(user123): ${isValid}`);
    });
    db.close();
});
