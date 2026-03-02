async function testUpdate() {
    try {
        // 1. Login as admin
        const loginRes = await fetch('http://localhost:8001/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin@gmail.com',
                password: 'admin123'
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.user.access;

        // 2. Try to update user with id 2 (John Doe) without changing username
        const updateRes = await fetch('http://localhost:8001/api/user/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id: 2,
                username: 'john.doe',
                email: 'john.doe.updated@example.com',
                groups: ['staff']
            })
        });
        
        const updateData = await updateRes.json();
        console.log("Update response:", updateRes.status, updateData);
    } catch (e) {
        console.error("Update failed:", e);
    }
}

testUpdate();
