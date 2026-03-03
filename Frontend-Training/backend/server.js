const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = 8001;
const SECRET_KEY = process.env.JWT_SECRET || 'supersecretkey123';
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey123';

app.use(cors());
app.use(express.json());

// Middleware for auth
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(401);
        req.user = user;
        next();
    });
};

// ==========================
// AUTH & USER ENDPOINTS
// ==========================

// Register
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body.user || req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    
    db.run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, 'staff'],
        function (err) {
            if (err) {
                return res.status(400).json({ error: 'Username or email already exists' });
            }
            res.status(201).json({
                user: {
                    id: this.lastID,
                    username,
                    email,
                    groups: ['staff']
                }
            });
        }
    );
});

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body.user || req.body;

    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const tokenPayload = { id: user.id, username: user.username };
        const access = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: '1h' });
        const refresh = jwt.sign(tokenPayload, REFRESH_SECRET_KEY, { expiresIn: '7d' });

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                groups: [user.role || 'staff'],
                is_active: Boolean(user.is_active),
                access,
                refresh
            }
        });
    });
});

// Refresh Token
app.post('/api/token/refresh', (req, res) => {
    const refreshToken = req.body.refresh_token || req.body.refresh;
    if (!refreshToken) return res.sendStatus(401);

    jwt.verify(refreshToken, REFRESH_SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(401);

        const tokenPayload = { id: user.id, username: user.username };
        const newAccess = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: '1h' });
        
        // Return matching what frontend interceptor expects
        res.json({
            access: newAccess,
            refresh: Object.keys(req.body).includes('refresh') ? refreshToken : undefined
        });
    });
});

// Get Users List
app.get('/api/users', authenticateToken, (req, res) => {
    db.all('SELECT id, username, email, is_active, role, date(CURRENT_TIMESTAMP) as date_joined FROM users', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const mappedUsers = rows.map(r => ({ ...r, is_active: Boolean(r.is_active), groups: [r.role || 'staff'] }));
        res.json({
            count: mappedUsers.length,
            results: mappedUsers
        });
    });
});

// Get Profile
app.get('/api/profile', authenticateToken, (req, res) => {
    db.get('SELECT id, username, email, is_active, role FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err || !user) return res.sendStatus(404);
        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                is_active: Boolean(user.is_active),
                groups: [user.role || 'staff']
            }
        });
    });
});

// Update User
app.put('/api/user/update', authenticateToken, async (req, res) => {
    const { id, username, email, password, is_active, groups } = req.body;
    
    // allow updating any user if admin, otherwise only self (simple check)
    if (!id && !req.user.id) return res.status(400).json({ error: 'Missing user ID' });
    const targetId = id || req.user.id;
    
    let role = undefined;
    if (groups && groups.length > 0) role = groups[0];

    try {
        let passwordHash = undefined;
        let queryArgs = [username, email, is_active, role, targetId];
        let setQuery = `UPDATE users SET 
                username = COALESCE(?, username),
                email = COALESCE(?, email),
                is_active = COALESCE(?, is_active),
                role = COALESCE(?, role)`;

        if (password && password.trim().length > 0) {
            passwordHash = await bcrypt.hash(password, 10);
            setQuery += `, password = ?`;
            queryArgs = [username, email, is_active, role, passwordHash, targetId];
        }

        setQuery += ` WHERE id = ?`;

        db.run(setQuery, queryArgs, function (err) {
            if (err) {
                console.error("[UPDATE_USER] Error:", err.message);
                if (err.message.includes('UNIQUE constraint failed: users.username')) {
                    return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
                }
                if (err.message.includes('UNIQUE constraint failed: users.email')) {
                    return res.status(400).json({ error: 'Email đã được sử dụng' });
                }
                return res.status(400).json({ error: err.message });
            }
            
            db.get('SELECT id, username, email, is_active, role FROM users WHERE id = ?', [targetId], (err, row) => {
                if (row) {
                    row.is_active = Boolean(row.is_active);
                    row.groups = [row.role || 'staff'];
                    delete row.role;
                }
                res.json({ success: true, user: row });
            });
        });
    } catch (err) {
        console.error("[UPDATE_USER] Catch:", err.message);
        res.status(500).json({ error: "Lỗi máy chủ khi cập nhật tài khoản." });
    }
});

// Delete User
app.delete('/api/user/:id', authenticateToken, (req, res) => {
    // Basic check: prevent deleting self or without ID
    const targetId = req.params.id;
    if (!targetId) return res.status(400).json({ error: 'Missing user ID' });
    if (targetId == req.user.id) return res.status(400).json({ error: 'Cannot delete your own account admin profile!' });
    
    db.run('DELETE FROM users WHERE id = ?', [targetId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ success: true, message: 'User deleted successfully' });
    });
});

// ==========================
// TASKS ENDPOINTS
// ==========================

// Get all tasks
app.get('/api/task', authenticateToken, (req, res) => {
    db.all('SELECT * FROM tasks', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Create task
app.post('/api/task', authenticateToken, (req, res) => {
    const { title, description, status, priority, due_date, assignee } = req.body;
    
    db.run(
        `INSERT INTO tasks (title, description, status, priority, due_date, owner, assignee) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, description, status || 'pending', priority || 'medium', due_date, req.user.id, assignee],
        function (err) {
            if (err) return res.status(400).json({ error: err.message });
            
            db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, row) => {
                res.status(201).json(row);
            });
        }
    );
});

// Update task
app.put('/api/task/:id', authenticateToken, (req, res) => {
    const { title, description, status, priority, due_date, assignee } = req.body;
    const taskId = req.params.id;

    db.run(
        `UPDATE tasks SET 
            title = COALESCE(?, title),
            description = COALESCE(?, description),
            status = COALESCE(?, status),
            priority = COALESCE(?, priority),
            due_date = COALESCE(?, due_date),
            assignee = COALESCE(?, assignee)
         WHERE id = ?`,
        [title, description, status, priority, due_date, assignee, taskId],
        function (err) {
            if (err) return res.status(400).json({ error: err.message });
            
            db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, row) => {
                res.json(row);
            });
        }
    );
});

// Delete task
app.delete('/api/task/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM tasks WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.sendStatus(204);
    });
});

// Get task stats
app.get('/api/task/stats', authenticateToken, (req, res) => {
    db.all('SELECT status, COUNT(*) as count FROM tasks GROUP BY status', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const stats = rows.reduce((acc, row) => {
            acc[row.status] = row.count;
            return acc;
        }, {});
        res.json(stats);
    });
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, server };
