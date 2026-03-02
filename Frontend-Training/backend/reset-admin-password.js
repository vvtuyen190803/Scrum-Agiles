const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('database.sqlite');

const hash = bcrypt.hashSync('admin123', 10);
db.run("UPDATE users SET password = ? WHERE email = 'admin@gmail.com' OR username = 'admin@gmail.com' OR username = 'admin'", [hash], function(err) { 
    if (err) console.error(err); 
    else console.log('Admin password successfully updated to admin123!');
    db.close();
});
