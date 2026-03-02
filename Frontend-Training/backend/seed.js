const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
        process.exit(1);
    }
});

const seedDatabase = () => {
    db.serialize(() => {
        console.log('Clearing existing tables...');
        db.run('DROP TABLE IF EXISTS tasks');
        db.run('DROP TABLE IF EXISTS users');

        console.log('Creating tables...');
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            password TEXT,
            first_name TEXT,
            last_name TEXT,
            is_active BOOLEAN DEFAULT 1
        )`);

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

        console.log('Inserting sample users...');
        const insertUser = db.prepare("INSERT INTO users (username, email, password, first_name, last_name, is_active) VALUES (?, ?, ?, ?, ?, ?)");
        
        const hashAdmin = bcrypt.hashSync("admin123", 10);
        const hashUser = bcrypt.hashSync("user123", 10);

        insertUser.run("admin@gmail.com", "admin@gmail.com", hashAdmin, "Admin", "User", 1);
        insertUser.run("john.doe", "john@example.com", hashUser, "John", "Doe", 1);
        insertUser.run("jane.smith", "jane@example.com", hashUser, "Jane", "Smith", 1);
        insertUser.finalize();

        console.log('Inserting sample tasks...');
        const insertTask = db.prepare("INSERT INTO tasks (title, description, status, priority, due_date, owner, assignee) VALUES (?, ?, ?, ?, ?, ?, ?)");
        
        // Assuming Admin is id 1, John is id 2, Jane is id 3
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        insertTask.run(
            "Thiết kế giao diện trang chủ",
            "Sử dụng Figma để thiết kế giao diện trang chủ mới cho dự án quản lý công việc.",
            "in_progress",
            "high",
            nextWeek.toISOString(),
            1, // owner admin
            2  // assignee john
        );

        insertTask.run(
            "Viết API đăng nhập",
            "Tạo API login bằng NodeJS và Express, sử dụng JWT để phân quyền.",
            "completed",
            "high",
            today.toISOString(),
            1, 
            3 
        );

        insertTask.run(
            "Tối ưu hoá truy vấn Database",
            "Kiểm tra lại các câu query và thêm index cần thiết.",
            "pending",
            "medium",
            nextWeek.toISOString(),
            1, 
            1
        );
        
        insertTask.run(
            "Viết unit test cho trang Tasks",
            "Sử dụng Jest và React Testing Library để viết test cho component Tasks.",
            "pending",
            "low",
            null,
            1, 
            2 
        );

        insertTask.finalize();

        console.log('Database seeded successfully!');
        db.close();
    });
};

seedDatabase();
