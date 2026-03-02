const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
    db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, desc TEXT)');
    db.run('INSERT INTO users (username, desc) VALUES (?, ?)', ['user1', 'first']);
    db.run('INSERT INTO users (username, desc) VALUES (?, ?)', ['user2', 'second']);
    
    // Test what happens if we pass undefined as parameter
    db.run('UPDATE users SET username = COALESCE(?, username), desc = COALESCE(?, desc) WHERE id = 1', [undefined, 'updated'], function(err) {
        if (err) console.error("Error 1:", err.message);
        else console.log("Success 1");
    });

    db.run('UPDATE users SET username = COALESCE(?, username), desc = COALESCE(?, desc) WHERE id = 2', [undefined, 'updated2'], function(err) {
        if (err) console.error("Error 2:", err.message);
        else console.log("Success 2");
    });
    
    db.all("SELECT * FROM users", (err, rows) => {
        console.log("Rows:", rows);
    });
});
